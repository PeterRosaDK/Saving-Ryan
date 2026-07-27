#include <filesystem>
#include <fstream>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <string>
#include <vector>

#include "libreshockwave/DirectorFile.hpp"
#include "libreshockwave/cast/MemberType.hpp"
#include "libreshockwave/chunks/CastListChunk.hpp"
#include "libreshockwave/chunks/CastMemberChunk.hpp"
#include "libreshockwave/chunks/FrameLabelsChunk.hpp"
#include "libreshockwave/chunks/ScoreChunk.hpp"
#include "libreshockwave/chunks/ScriptChunk.hpp"
#include "libreshockwave/chunks/TextChunk.hpp"
#include "libreshockwave/lingo/decompiler/LingoDecompiler.hpp"

namespace {

std::vector<std::uint8_t> readFile(const std::filesystem::path& path) {
    std::ifstream input(path, std::ios::binary);
    if (!input) {
        throw std::runtime_error("Unable to open " + path.string());
    }
    return {std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>()};
}

std::string clean(std::string value) {
    for (char& ch : value) {
        if (ch == '\r') {
            ch = '\n';
        }
        if (ch == '\0') {
            ch = ' ';
        }
    }
    return value;
}

int readBigEndian16(
    const std::vector<std::uint8_t>& data,
    std::size_t offset
) {
    if (offset + 1 >= data.size()) {
        return 0;
    }
    return (static_cast<int>(data[offset]) << 8) |
        static_cast<int>(data[offset + 1]);
}

int readBigEndian32(
    const std::vector<std::uint8_t>& data,
    std::size_t offset
) {
    if (offset + 3 >= data.size()) {
        return 0;
    }
    return (static_cast<int>(data[offset]) << 24) |
        (static_cast<int>(data[offset + 1]) << 16) |
        (static_cast<int>(data[offset + 2]) << 8) |
        static_cast<int>(data[offset + 3]);
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: saving_ryan_director_dump <movie.dir>...\n";
        return 2;
    }

    for (int arg = 1; arg < argc; ++arg) {
        const std::filesystem::path path = argv[arg];
        auto file = libreshockwave::DirectorFile::load(readFile(path));
        file->setBasePath(path.parent_path().string());

        std::cout << "\n===== FILE " << path.string() << " =====\n";
        std::cout << "version=" << file->version()
                  << " stage=" << file->stageWidth() << 'x' << file->stageHeight()
                  << " tempo=" << file->tempo()
                  << " castMembers=" << file->castMembers().size()
                  << " scripts=" << file->scripts().size() << '\n';

        if (const auto castList = file->castList()) {
            std::cout << "\n--- CAST LIBRARIES ---\n";
            for (const auto& entry : castList->entries()) {
                std::cout << "id=" << entry.id
                          << " name=\"" << clean(entry.name) << "\""
                          << " path=\"" << clean(entry.path) << "\""
                          << " range=" << entry.minMember << '-' << entry.maxMember
                          << " count=" << entry.memberCount << '\n';
            }
        }

        if (const auto labels = file->frameLabelsChunk()) {
            std::cout << "\n--- FRAME LABELS ---\n";
            for (const auto& label : labels->labels()) {
                std::cout << label.frameNum.value() << '\t' << clean(label.label) << '\n';
            }
        }

        std::cout << "\n--- SCORE CHUNKS ---\n";
        for (const auto& [chunkId, chunk] : file->chunks()) {
            const auto candidate =
                std::dynamic_pointer_cast<libreshockwave::chunks::ScoreChunk>(
                    chunk
                );
            if (!candidate) {
                continue;
            }
            std::cout << "chunk=" << chunkId
                      << " frames=" << candidate->getFrameCount()
                      << " intervals=" << candidate->frameIntervals().size()
                      << " sprites="
                      << candidate->frameData().frameChannelData.size()
                      << '\n';
        }

        if (const auto score = file->scoreChunk()) {
            const auto& frameData = score->frameData();
            const auto& header = frameData.header;
            if (header.framesVersion > 7 && header.framesVersion <= 13) {
                constexpr int mainChannelsSize = 144;
                constexpr int displayedChannels = 120;
                const int frameSize =
                    mainChannelsSize + displayedChannels * header.spriteRecordSize;
                int previousSound1CastLib = -1;
                int previousSound1Member = -1;
                int previousSound2CastLib = -1;
                int previousSound2Member = -1;
                int previousSound1SpriteList = -1;
                int previousSound2SpriteList = -1;

                std::cout << "\n--- SCORE SOUNDS ---\n";
                for (int frame = 0; frame < header.frameCount; ++frame) {
                    const auto frameOffset =
                        static_cast<std::size_t>(frame) *
                        static_cast<std::size_t>(frameSize);
                    const int sound2CastLib =
                        readBigEndian16(frameData.decompressedData, frameOffset + 72);
                    const int sound2Member =
                        readBigEndian16(frameData.decompressedData, frameOffset + 74);
                    const int sound2SpriteList =
                        readBigEndian32(frameData.decompressedData, frameOffset + 76);
                    const int sound1CastLib =
                        readBigEndian16(frameData.decompressedData, frameOffset + 96);
                    const int sound1Member =
                        readBigEndian16(frameData.decompressedData, frameOffset + 98);
                    const int sound1SpriteList =
                        readBigEndian32(frameData.decompressedData, frameOffset + 100);

                    if (
                        sound1CastLib == previousSound1CastLib &&
                        sound1Member == previousSound1Member &&
                        sound2CastLib == previousSound2CastLib &&
                        sound2Member == previousSound2Member &&
                        sound1SpriteList == previousSound1SpriteList &&
                        sound2SpriteList == previousSound2SpriteList
                    ) {
                        continue;
                    }

                    const auto soundName = [&file](int castLib, int memberNumber) {
                        if (memberNumber == 0) {
                            return std::string{};
                        }
                        const int resolvedCastLib = castLib > 0 ? castLib : 1;
                        if (const auto member =
                                file->getCastMemberByNumber(
                                    resolvedCastLib,
                                    memberNumber
                                )) {
                            return clean(member->name());
                        }
                        return std::string{"<external or unresolved>"};
                    };

                    std::cout << "frame=" << frame + 1
                              << " sound1=" << sound1CastLib << ':'
                              << sound1Member << " \"" << soundName(
                                  sound1CastLib,
                                  sound1Member
                              ) << "\" list=" << sound1SpriteList
                              << " sound2=" << sound2CastLib << ':'
                              << sound2Member << " \"" << soundName(
                                  sound2CastLib,
                                  sound2Member
                              ) << "\" list=" << sound2SpriteList << '\n';

                    previousSound1CastLib = sound1CastLib;
                    previousSound1Member = sound1Member;
                    previousSound2CastLib = sound2CastLib;
                    previousSound2Member = sound2Member;
                    previousSound1SpriteList = sound1SpriteList;
                    previousSound2SpriteList = sound2SpriteList;
                }
            }
        }

        std::cout << "\n--- CAST MEMBERS ---\n";
        for (const auto& member : file->castMembers()) {
            if (!member) {
                continue;
            }
            int memberNumber = 0;
            for (int candidate = 1; candidate <= 1000; ++candidate) {
                if (file->getCastMemberByNumber(1, candidate) == member) {
                    memberNumber = candidate;
                    break;
                }
            }
            std::cout << "number=" << memberNumber
                      << " chunk=" << member->id().value()
                      << " type=" << libreshockwave::cast::name(member->memberType())
                      << " name=\"" << clean(member->name()) << "\""
                      << " scriptId=" << member->scriptId();
            if (const auto text = file->getTextForMember(member); text && !text->text().empty()) {
                std::cout << " text=\"" << clean(text->text()) << '"';
            }
            std::cout << '\n';
        }

        std::cout << "\n--- DECOMPILED LINGO ---\n";
        libreshockwave::lingo::decompiler::LingoDecompiler decompiler;
        for (const auto& script : file->scripts()) {
            if (!script) {
                continue;
            }
            const auto names = file->getScriptNamesForScript(script);
            std::cout << "\n### script chunk=" << script->id().value()
                      << " name=\"" << clean(file->getScriptName(script)) << "\""
                      << " type=" << static_cast<int>(script->resolvedScriptType())
                      << " handlers=" << script->handlers().size() << '\n';
            try {
                std::cout << decompiler.decompile(*script, names.get());
            } catch (const std::exception& error) {
                std::cout << "-- decompile error: " << error.what() << '\n';
                for (const auto& handler : script->handlers()) {
                    std::cout << decompiler.formatHandlerBytecodeOnly(handler, names.get());
                }
            }
            std::cout << '\n';
        }
    }
}
