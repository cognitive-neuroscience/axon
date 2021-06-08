export enum RouteNames {
    LANDINGPAGE_LOGIN_SUBROUTE = "login",
    LANDINGPAGE_REGISTER_SUBROUTE = "register",
}

export enum AdminRouteNames {
    DASHBOARD_BASEROUTE = "admin-dashboard",

    COMPONENTS_SUBROUTE = "components",
    DATA_SUBROUTE = "data",
    GUESTS_SUBROUTE = "guests",
    STUDIES_SUBROUTE = "studies",
    STUDIES_CREATE_SUBROUTE = "create",
    STUDIES_VIEW_SUBROUTE = "view",
}

export enum ParticipantRouteNames {
    DASHBOARD_BASEROUTE = "participant-dashboard",
    CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE = "crowdsource-participant",

    STUDIES_SUBROUTE = "studies",
    PROFILE_SUBROUTE = "profile",
}

// Each task is one of the following type
export enum TaskType {
    NAB = "NAB",
    EXPERIMENTAL = "EXPERIMENTAL",
    QUESTIONNAIRE = "QUESTIONNAIRE",
    CONSENT = "CONSENT",
}

export enum Platform {
    PSHARPLAB = "PSHARPLAB",
    SURVEYMONKEY = "SURVEYMONEKY",
    PAVLOVIA = "PAVLOVIA",
}

export enum SnackbarType {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    INFO = "INFO",
}

export enum Role {
    ADMIN = "ADMIN",
    PARTICIPANT = "PARTICIPANT",
    GUEST = "GUEST", // access to admin views but cannot make any calls to backend
}
