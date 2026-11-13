// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "MetisCrashPrivacy",
  platforms: [.macOS(.v13), .iOS(.v15)],
  dependencies: [.package(url: "https://github.com/getsentry/sentry-cocoa.git", exact: "8.58.0")],
  targets: [
    .target(name: "MetisCrashPrivacy", dependencies: [.product(name: "Sentry", package: "sentry-cocoa")],
      path: "ios", exclude: ["MetisCrashReportingModule.swift", "MetisCrashReporting.podspec", "PrivacyInfo.xcprivacy"]),
    .testTarget(name: "MetisCrashPrivacyTests", dependencies: ["MetisCrashPrivacy"], path: "tests"),
  ]
)
