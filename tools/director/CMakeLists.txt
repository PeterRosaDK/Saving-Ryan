cmake_minimum_required(VERSION 3.20)

project(SavingRyanDirectorTools LANGUAGES CXX)

set(
  LIBRESHOCKWAVE_SOURCE_DIR
  ""
  CACHE PATH
  "Path to a LibreShockwave source checkout"
)

if(NOT EXISTS "${LIBRESHOCKWAVE_SOURCE_DIR}/CMakeLists.txt")
  message(
    FATAL_ERROR
    "Set LIBRESHOCKWAVE_SOURCE_DIR to a LibreShockwave source checkout."
  )
endif()

add_subdirectory(
  "${LIBRESHOCKWAVE_SOURCE_DIR}"
  "${CMAKE_BINARY_DIR}/libreshockwave"
  EXCLUDE_FROM_ALL
)

find_package(ZLIB REQUIRED)

add_executable(saving_ryan_director_dump DirectorDump.cpp)
target_link_libraries(
  saving_ryan_director_dump
  PRIVATE
    LibreShockwave::libreshockwave
)
target_compile_features(saving_ryan_director_dump PRIVATE cxx_std_20)

add_executable(saving_ryan_extract_bitmaps ExtractDirectorBitmaps.cpp)
target_link_libraries(
  saving_ryan_extract_bitmaps
  PRIVATE
    LibreShockwave::libreshockwave
    ZLIB::ZLIB
)
target_compile_features(saving_ryan_extract_bitmaps PRIVATE cxx_std_20)

add_executable(saving_ryan_extract_sounds ExtractDirectorSounds.cpp)
target_link_libraries(
  saving_ryan_extract_sounds
  PRIVATE
    LibreShockwave::libreshockwave
)
target_compile_features(saving_ryan_extract_sounds PRIVATE cxx_std_20)
