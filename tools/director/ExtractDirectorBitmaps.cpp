#include <cctype>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <string>
#include <vector>

#include <zlib.h>

#include "libreshockwave/DirectorFile.hpp"
#include "libreshockwave/bitmap/Bitmap.hpp"
#include "libreshockwave/chunks/CastMemberChunk.hpp"

namespace {

namespace fs = std::filesystem;

std::vector<std::uint8_t> readFile(const fs::path& path) {
    std::ifstream input(path, std::ios::binary);
    if (!input) {
        throw std::runtime_error("Unable to open " + path.string());
    }
    return {std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>()};
}

void appendU32(std::vector<std::uint8_t>& data, std::uint32_t value) {
    data.push_back(static_cast<std::uint8_t>((value >> 24) & 0xFFU));
    data.push_back(static_cast<std::uint8_t>((value >> 16) & 0xFFU));
    data.push_back(static_cast<std::uint8_t>((value >> 8) & 0xFFU));
    data.push_back(static_cast<std::uint8_t>(value & 0xFFU));
}

void appendChunk(std::vector<std::uint8_t>& png,
                 const std::string& type,
                 const std::vector<std::uint8_t>& payload) {
    appendU32(png, static_cast<std::uint32_t>(payload.size()));
    const auto crcOffset = png.size();
    png.insert(png.end(), type.begin(), type.end());
    png.insert(png.end(), payload.begin(), payload.end());
    uLong crc = crc32(0L, Z_NULL, 0);
    crc = crc32(crc,
                reinterpret_cast<const Bytef*>(png.data() + crcOffset),
                static_cast<uInt>(png.size() - crcOffset));
    appendU32(png, static_cast<std::uint32_t>(crc));
}

std::vector<std::uint8_t> encodePng(const libreshockwave::bitmap::Bitmap& bitmap) {
    std::vector<std::uint8_t> ihdr;
    appendU32(ihdr, static_cast<std::uint32_t>(bitmap.width()));
    appendU32(ihdr, static_cast<std::uint32_t>(bitmap.height()));
    ihdr.insert(ihdr.end(), {8, 6, 0, 0, 0});

    std::vector<std::uint8_t> scanlines;
    scanlines.reserve(static_cast<std::size_t>((bitmap.width() * 4 + 1) * bitmap.height()));
    for (int y = 0; y < bitmap.height(); ++y) {
        scanlines.push_back(0);
        for (int x = 0; x < bitmap.width(); ++x) {
            const auto pixel = bitmap.getPixel(x, y);
            scanlines.push_back(static_cast<std::uint8_t>((pixel >> 16) & 0xFFU));
            scanlines.push_back(static_cast<std::uint8_t>((pixel >> 8) & 0xFFU));
            scanlines.push_back(static_cast<std::uint8_t>(pixel & 0xFFU));
            scanlines.push_back(static_cast<std::uint8_t>((pixel >> 24) & 0xFFU));
        }
    }

    uLongf compressedLength = compressBound(static_cast<uLong>(scanlines.size()));
    std::vector<std::uint8_t> compressed(static_cast<std::size_t>(compressedLength));
    const int status = compress2(compressed.data(),
                                 &compressedLength,
                                 scanlines.data(),
                                 static_cast<uLong>(scanlines.size()),
                                 Z_BEST_COMPRESSION);
    if (status != Z_OK) {
        throw std::runtime_error("Unable to compress PNG data");
    }
    compressed.resize(static_cast<std::size_t>(compressedLength));

    std::vector<std::uint8_t> png{0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};
    appendChunk(png, "IHDR", ihdr);
    appendChunk(png, "IDAT", compressed);
    appendChunk(png, "IEND", {});
    return png;
}

std::string safeName(std::string name, int fallbackId) {
    for (char& ch : name) {
        if (!(std::isalnum(static_cast<unsigned char>(ch)) || ch == '-' || ch == '_')) {
            ch = '_';
        }
    }
    if (name.empty()) {
        name = "bitmap-" + std::to_string(fallbackId);
    }
    return name;
}

} // namespace

int main(int argc, char** argv) {
    if (argc != 3) {
        std::cerr << "Usage: saving_ryan_extract_bitmaps <movie.dir> <output-directory>\n";
        return 2;
    }

    const fs::path inputPath = argv[1];
    const fs::path outputDirectory = argv[2];
    fs::create_directories(outputDirectory);

    auto file = libreshockwave::DirectorFile::load(readFile(inputPath));
    file->setBasePath(inputPath.parent_path().string());

    int extracted = 0;
    int failed = 0;
    for (const auto& member : file->castMembers()) {
        if (!member || !member->isBitmap()) {
            continue;
        }

        const auto decoded = file->decodeBitmap(member);
        if (!decoded) {
            ++failed;
            std::cerr << "FAILED\t" << member->id().value() << '\t' << member->name() << '\n';
            continue;
        }

        const auto fileName = safeName(member->name(), member->id().value()) + ".png";
        const auto outputPath = outputDirectory / fileName;
        const auto png = encodePng(*decoded);
        std::ofstream output(outputPath, std::ios::binary);
        output.write(reinterpret_cast<const char*>(png.data()), static_cast<std::streamsize>(png.size()));
        if (!output) {
            throw std::runtime_error("Unable to write " + outputPath.string());
        }

        ++extracted;
        std::cout << "OK\t" << member->id().value() << '\t' << member->name()
                  << '\t' << decoded->width() << 'x' << decoded->height()
                  << '\t' << outputPath.string() << '\n';
    }

    std::cout << "SUMMARY\textracted=" << extracted << "\tfailed=" << failed << '\n';
    return failed == 0 ? 0 : 1;
}
