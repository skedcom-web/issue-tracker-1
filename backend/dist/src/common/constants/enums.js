"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueEnvironment = exports.IssueType = exports.IssueSeverity = exports.IssuePriority = exports.IssueStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["Admin"] = "Admin";
    Role["Manager"] = "Manager";
    Role["Developer"] = "Developer";
    Role["QA"] = "QA";
    Role["Reporter"] = "Reporter";
})(Role || (exports.Role = Role = {}));
var IssueStatus;
(function (IssueStatus) {
    IssueStatus["Open"] = "Open";
    IssueStatus["InProgress"] = "InProgress";
    IssueStatus["InReview"] = "InReview";
    IssueStatus["Resolved"] = "Resolved";
    IssueStatus["Closed"] = "Closed";
    IssueStatus["Reopened"] = "Reopened";
})(IssueStatus || (exports.IssueStatus = IssueStatus = {}));
var IssuePriority;
(function (IssuePriority) {
    IssuePriority["Critical"] = "Critical";
    IssuePriority["High"] = "High";
    IssuePriority["Medium"] = "Medium";
    IssuePriority["Low"] = "Low";
})(IssuePriority || (exports.IssuePriority = IssuePriority = {}));
var IssueSeverity;
(function (IssueSeverity) {
    IssueSeverity["Critical"] = "Critical";
    IssueSeverity["Blocker"] = "Blocker";
    IssueSeverity["Major"] = "Major";
    IssueSeverity["Minor"] = "Minor";
})(IssueSeverity || (exports.IssueSeverity = IssueSeverity = {}));
var IssueType;
(function (IssueType) {
    IssueType["Bug"] = "Bug";
    IssueType["Task"] = "Task";
    IssueType["FeatureRequest"] = "FeatureRequest";
    IssueType["Improvement"] = "Improvement";
})(IssueType || (exports.IssueType = IssueType = {}));
var IssueEnvironment;
(function (IssueEnvironment) {
    IssueEnvironment["Dev"] = "Dev";
    IssueEnvironment["QA"] = "QA";
    IssueEnvironment["UAT"] = "UAT";
    IssueEnvironment["Production"] = "Production";
})(IssueEnvironment || (exports.IssueEnvironment = IssueEnvironment = {}));
//# sourceMappingURL=enums.js.map