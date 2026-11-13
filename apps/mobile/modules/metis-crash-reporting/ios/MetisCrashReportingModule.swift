import ExpoModulesCore

public final class MetisCrashReportingModule: Module {
  private let reporter = NativeCrashReporter()

  public func definition() -> ModuleDefinition {
    Name("MetisCrashReporting")
    Function("start") { (dsn: String, metadata: [String: String]) in
      try self.reporter.start(dsn: dsn, metadata: metadata)
    }
    Function("stop") { self.reporter.stop() }
  }
}
