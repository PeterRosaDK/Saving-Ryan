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

        std::cout << "\n--- CAST MEMBERS ---\n";
        for (const auto& member : file->castMembers()) {
            if (!member) {
                continue;
            }
            std::cout << "chunk=" << member->id().value()
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
