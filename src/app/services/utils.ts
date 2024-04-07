import { Study } from '../models/Study';
import { StudyTask } from '../models/StudyTask';

export const snapshotToStudyTasks = (study: Study): StudyTask[] => {
    let latestSnapshotDate: string;
    Object.keys(study.snapshots).forEach((snapshotDate) => {
        if (!latestSnapshotDate) {
            latestSnapshotDate = snapshotDate;
        } else {
            const latestSnapshot = new Date(latestSnapshotDate);
            const currSnapshot = new Date(snapshotDate);
            if (currSnapshot > latestSnapshot) {
                latestSnapshotDate = snapshotDate;
            }
        }
    });

    if (!latestSnapshotDate) {
        return study.studyTasks;
    } else {
        return study.snapshots[latestSnapshotDate].map((snapshotTask) => ({
            studyId: study.id,
            taskOrder: snapshotTask.taskOrder,
            task: {
                id: snapshotTask.id,
                name: snapshotTask.name,
                description: snapshotTask.description,
                taskType: snapshotTask.taskType,
                fromPlatform: snapshotTask.fromPlatform,
                config: snapshotTask.config,
                externalURL: snapshotTask.externalURL,
            },
            config: {},
        }));
    }
};
