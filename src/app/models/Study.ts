import { InfoDisplayViewerMetadata } from '../pages/shared/info-display-viewer/info-display-viewer.component';
import { NullTime } from './InternalDTOs';
import { StudyTask } from './StudyTask';
import { Task } from './Task';
import { User } from './User';

export class ReroutingConfig {
    mustCompleteOneOf: {
        studyId: number;
        currentTaskIndex: number;
    }[]; // this will be logical OR – at least one of the studies in this list must have been completed
    rerouteTo: number;
}

export class Study {
    id: number;
    createdAt: string;
    deletedAt: NullTime;
    internalName: string;
    externalName: string;
    started: boolean;
    canEdit: boolean;
    consent: Task;
    owner: Partial<User>;
    description: string;
    /*
     * json metadata that describes the study, used for study background landing page
     * config would be of type InfoDisplayViewerMetadata & RoutingConfig
     */
    config?: {
        rerouteConfig?: ReroutingConfig;
    } & Partial<InfoDisplayViewerMetadata>;
    studyTasks: StudyTask[];
    snapshots: {
        [key: string]: (Task & { taskOrder: number })[]; // a copy of the json task metadata or questionnaire metadata at a given point in time
    };
}
