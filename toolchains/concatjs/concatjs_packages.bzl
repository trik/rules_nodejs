"""Info for the concatjs binaries used"""

load("//:version.bzl", "VERSION")

_DARWIN_AMD64_SHA = "272dbce57de9dd8cf882b9ba1a4b155025594dbc786663a3fe9f7fc8b3dad10b"
_DARWIN_ARM64_SHA = "75ae0bb9185088804df949b762c2ec0020bb3f9925d79a23449376132741243c"
_LINUX_AMD64_SHA = "854e6cbdc421c65b812e9ecd6a50a5d6c4496fb85ac48c6fedafb45e683583e5"
_LINUX_ARM64_SHA = "748ae3185f6a246249e880df51010c8279fa0d2ab86b8637b900d68857821555"
_LINUX_PPC64LE_SHA = "a592a37d0adeb9a9be44fff28fd07fd9bd1941b723e89cfc2b72314200b4aa79"
_LINUX_S390X_SHA = "dd425ded6142730f3f8fecc72a5931837c8b3d9c56f0a45642d006b6ee173d7a"
_WINDOWS_AMD64_SHA = "c35d78ad51516b23e06818025d1f178638826899b5392cedae351f0b00cd39c7"

CONCATJS_PACKAGES = struct(
    platforms = dict({
        "darwin_amd64": struct(
            sha = _DARWIN_AMD64_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-darwin_x64" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:macos",
                "@platforms//cpu:x86_64",
            ],
        ),
        "darwin_arm64": struct(
            sha = _DARWIN_ARM64_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-darwin_arm64" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:macos",
                "@platforms//cpu:aarch64",
            ],
        ),
        "linux_amd64": struct(
            sha = _LINUX_AMD64_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-linux_x64" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:linux",
                "@platforms//cpu:x86_64",
            ],
        ),
        "linux_arm64": struct(
            sha = _LINUX_ARM64_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-linux_arm64" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:linux",
                "@platforms//cpu:aarch64",
            ],
        ),
        "linux_s390x": struct(
            sha = _LINUX_S390X_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-linux_s390x" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:linux",
                "@platforms//cpu:aarch64",
            ],
        ),
        "linux_ppc64le": struct(
            sha = _LINUX_PPC64LE_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-linux_ppc64le" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:linux",
                "@platforms//cpu:aarch64",
            ],
        ),
        "windows_amd64": struct(
            sha = _WINDOWS_AMD64_SHA,
            urls = [
                "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/concatjs-windows_x64.exe" % VERSION,
            ],
            exec_compatible_with = [
                "@platforms//os:windows",
                "@platforms//cpu:x86_64",
            ],
        ),
    }),
)
