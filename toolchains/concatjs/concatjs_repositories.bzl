"""
Helper macro for fetching concatjs binaries
"""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")
load(":concatjs_packages.bzl", "CONCATJS_PACKAGES")

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)

def concatjs_repositories(name = ""):
    """Helper for fetching and setting up the concatjs toolchain

    Args:
        name: currently unused
    """

    for name, meta in CONCATJS_PACKAGES.platforms.items():
        _maybe(
            http_file,
            name = "concatjs_%s" % name,
            urls = meta.urls,
            sha256 = meta.sha,
        )

        toolchain_label = Label("@build_bazel_rules_nodejs//toolchains/concatjs:concatjs_%s_toolchain" % name)
        native.register_toolchains("@%s//%s:%s" % (toolchain_label.workspace_name, toolchain_label.package, toolchain_label.name))
