#include <algorithm>
#include <cctype>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <iterator>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include "libreshockwave/DirectorFile.hpp"
#include "libreshockwave/audio/SoundConverter.hpp"
#include "libreshockwave/chunks/CastMemberChunk.hpp"
#include "libreshockwave/chunks/MediaChunk.hpp"
#include "libreshockwave/chunks/RawChunk.hpp"
#include "libreshockwave/chunks/SoundChunk.hpp"
#include "libreshockwave/io/BinaryReader.hpp"

namespace {

namespace fs = std::filesystem;

std::vector<std::uint8_t> readFile(const fs::path& path) {
    std::ifstream input(path, std::ios::binary);
    if (!input) {
        throw std::runtime_error("Unable to open " + path.string());
    }
    return {
        std::istreambuf_iterator<char>(input),
        std::istreambuf_iterator<char>(),
    };
}

std::string safeName(std::string name, int fallbackId) {
    for (char& ch : name) {
        if (!(std::isalnum(static_cast<unsigned char>(ch)) ||
              ch == '-' || ch == '_')) {
            ch = '_';
        }
    }
    if (name.empty()) {
        name = "sound-" + std::to_string(fallbackId);
    }
    return name;
}

std::uint32_t readBigEndianU32(
    const std::vector<std::uint8_t>& data,
    std::size_t offset
) {
    if (offset + 4 > data.size()) {
        throw std::runtime_error("Truncated Director sound header");
    }
    return
        (static_cast<std::uint32_t>(data[offset]) << 24U) |
        (static_cast<std::uint32_t>(data[offset + 1]) << 16U) |
        (static_cast<std::uint32_t>(data[offset + 2]) << 8U) |
        static_cast<std::uint32_t>(data[offset + 3]);
}

void writeBytes(
    const fs::path& outputPath,
    const std::vector<std::uint8_t>& bytes
) {
    std::ofstream output(outputPath, std::ios::binary);
    output.write(
        reinterpret_cast<const char*>(bytes.data()),
        static_cast<std::streamsize>(bytes.size())
    );
    if (!output) {
        throw std::runtime_error("Unable to write " + outputPath.string());
    }
}

} // namespace

int main(int argc, char** argv) {
    if (argc != 3) {
        std::cerr
            << "Usage: saving_ryan_extract_sounds <movie.dir> <output-directory>\n";
        return 2;
    }

    const fs::path inputPath = argv[1];
    const fs::path outputDirectory = argv[2];
    fs::create_directories(outputDirectory);

    auto file = libreshockwave::DirectorFile::load(readFile(inputPath));
    file->setBasePath(inputPath.parent_path().string());

    int extracted = 0;
    for (const auto& member : file->castMembers()) {
        if (!member || !member->isSound()) {
            continue;
        }

        const auto linked = file->getLinkedChunksForMember(member);
        bool memberExtracted = false;
        for (const auto& chunk : linked) {
            auto sound =
                std::dynamic_pointer_cast<libreshockwave::chunks::SoundChunk>(
                    chunk
                );
            if (!sound || sound->audioData().empty()) {
                const auto media =
                    std::dynamic_pointer_cast<
                        libreshockwave::chunks::MediaChunk
                    >(chunk);
                if (media && !media->audioData().empty()) {
                    sound = std::make_shared<
                        libreshockwave::chunks::SoundChunk
                    >(media->toSoundChunk());
                }
            }
            if (!sound || sound->audioData().empty()) {
                continue;
            }

            const auto bytes = sound->isMp3()
                ? libreshockwave::audio::SoundConverter::extractMp3(*sound)
                      .value_or(std::vector<std::uint8_t>{})
                : sound->isAdpcm()
                    ? libreshockwave::audio::SoundConverter::imaAdpcmToWav(
                          sound->audioData(),
                          sound->sampleRate(),
                          sound->channelCount(),
                          0,
                          0
                      )
                    : libreshockwave::audio::SoundConverter::toWav(*sound);
            if (bytes.empty()) {
                throw std::runtime_error(
                    "Unable to decode sound member " + member->name()
                );
            }

            const auto extension = sound->isMp3() ? ".mp3" : ".wav";
            const auto fileName =
                safeName(member->name(), member->id().value()) + extension;
            const auto outputPath = outputDirectory / fileName;
            writeBytes(outputPath, bytes);

            ++extracted;
            memberExtracted = true;
            std::cout << "OK\t" << member->id().value() << '\t'
                      << member->name() << '\t'
                      << sound->durationSeconds() << "s\t"
                      << outputPath.string() << '\n';
            break;
        }

        if (!memberExtracted) {
            std::shared_ptr<libreshockwave::chunks::RawChunk> header;
            std::shared_ptr<libreshockwave::chunks::RawChunk> samples;
            for (const auto& chunk : linked) {
                const auto raw =
                    std::dynamic_pointer_cast<
                        libreshockwave::chunks::RawChunk
                    >(chunk);
                if (!raw) {
                    continue;
                }
                const auto* info = file->getChunkInfo(raw->id());
                if (!info) {
                    continue;
                }
                const auto fourcc =
                    libreshockwave::io::BinaryReader::fourCCToString(
                        info->fourcc
                    );
                if (fourcc == "sndH") {
                    header = raw;
                } else if (fourcc == "sndS") {
                    samples = raw;
                }
            }

            if (header && samples && header->data().size() >= 88) {
                const int sampleRate = static_cast<int>(
                    readBigEndianU32(header->data(), 44)
                );
                const int bitsPerSample = static_cast<int>(
                    readBigEndianU32(header->data(), 68)
                );
                const int channelCount = static_cast<int>(
                    readBigEndianU32(header->data(), 76)
                );
                if (
                    sampleRate < 8000 || sampleRate > 192000 ||
                    (bitsPerSample != 8 && bitsPerSample != 16) ||
                    channelCount < 1 || channelCount > 2
                ) {
                    throw std::runtime_error(
                        "Unsupported split Director sound format for " +
                        member->name()
                    );
                }

                const auto bytes =
                    libreshockwave::audio::SoundConverter::toWav(
                        samples->data(),
                        sampleRate,
                        bitsPerSample,
                        channelCount,
                        true
                    );
                const auto outputPath =
                    outputDirectory /
                    (
                        safeName(member->name(), member->id().value()) +
                        ".wav"
                    );
                writeBytes(outputPath, bytes);

                const auto duration =
                    libreshockwave::audio::SoundConverter::getDuration(
                        static_cast<int>(samples->data().size()),
                        sampleRate,
                        bitsPerSample,
                        channelCount
                    );
                ++extracted;
                memberExtracted = true;
                std::cout << "OK\t" << member->id().value() << '\t'
                          << member->name() << '\t' << duration << "s\t"
                          << outputPath.string() << '\n';
            }
        }

        if (!memberExtracted) {
            std::cerr << "FAILED\t" << member->id().value() << '\t'
                      << member->name() << "\tno supported sound data\n";
        }
    }

    std::cout << "SUMMARY\textracted=" << extracted << '\n';
    return extracted > 0 ? 0 : 1;
}
