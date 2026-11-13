require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))
Pod::Spec.new do |s|
  s.name = 'MetisCrashReporting'
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = package['license']
  s.author = 'Metis'
  s.homepage = 'https://metis.local'
  s.platforms = { :ios => '15.1' }
  s.swift_version = '5.9'
  s.source = { git: 'https://metis.local/metis.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'Sentry/HybridSDK', '8.58.0'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_COMPILATION_MODE' => 'wholemodule' }
  s.source_files = '**/*.swift'
  s.resource_bundles = { 'MetisCrashReportingPrivacy' => ['PrivacyInfo.xcprivacy'] }
end
