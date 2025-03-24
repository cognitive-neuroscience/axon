import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Study } from 'src/app/models/Study';
import { StudyTask } from 'src/app/models/StudyTask';
import { CrowdSourcedUserService } from 'src/app/services/crowdsourced-user.service';
import { FileService } from 'src/app/services/file.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import {
    getCrowdsourcedUserDataAsDataTableFormat,
    getParticipantDataAsDataTableFormat,
    getStudyUserDataAsDataTableFormat,
} from './data-tree.component.helpers';
import { UserStateService } from 'src/app/services/user-state-service';
import { ParticipantDataService } from 'src/app/services/study-data.service';
import { catchError } from 'rxjs/operators';
import { ParticipantData } from 'src/app/models/ParticipantData';

interface DataNode {
    name: string;
    studyTask?: StudyTask;
    clickAction?: () => void;
    disabled?: boolean;
    children?: DataNode[];
}

interface FlatNode {
    expandable: boolean;
    name: string;
    level: number;
}

@Component({
    selector: 'app-data-tree',
    templateUrl: './data-tree.component.html',
    styleUrls: ['./data-tree.component.scss'],
})
export class DataTreeComponent implements OnInit {
    constructor(
        private loaderService: LoaderService,
        private crowdSourcedUserService: CrowdSourcedUserService,
        private studyUserService: StudyUserService,
        private snackbarService: SnackbarService,
        private fileService: FileService,
        private userStateService: UserStateService,
        private participantDataService: ParticipantDataService
    ) {
        this.dataSource.data = [];
    }

    private _transformer = (node: DataNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            studyTask: node.studyTask,
            name: node.name,
            disabled: node.disabled,
            level: level,
            clickAction: node.clickAction,
        };
    };

    treeControl = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable
    );

    treeFlattener = new MatTreeFlattener(
        this._transformer,
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    private _study: Study;

    get isGuest(): boolean {
        return this.userStateService.userIsGuest;
    }

    downloadStudyUserData(study: Study) {
        this.loaderService.showLoader();

        this.studyUserService
            .getStudyUsersForStudy(study.id)
            .subscribe(
                (studyUsers) => {
                    const tabularData = getStudyUserDataAsDataTableFormat(studyUsers);
                    const fileName = `TASKDATA_${study.internalName}_ACCOUNT_HOLDERS`;

                    this.fileService.exportAsCSV(tabularData, fileName);
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar(err.message);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    downloadCrowdsourcedUserData(study: Study) {
        this.loaderService.showLoader();

        this.crowdSourcedUserService
            .getCrowdsourcedUsersByStudyId(study.id)
            .subscribe(
                (crowdsourcedUsers) => {
                    const tabularData = getCrowdsourcedUserDataAsDataTableFormat(crowdsourcedUsers);
                    const fileName = `TASKDATA_${study.internalName}_CROWDSOURCED_USERS`;

                    this.fileService.exportAsCSV(tabularData, fileName);
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar(err.message);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    downloadParticipantData(study: Study, studyTask: StudyTask) {
        this.loaderService.showLoader();
        if (this.isGuest) return;

        this.participantDataService
            .getParticipantData(study.id, studyTask.taskOrder)
            .pipe(
                catchError(() => {
                    this.snackbarService.openErrorSnackbar('there was an error getting task data');
                    throw new Error('error getting data');
                })
            )
            .subscribe((participantData: ParticipantData[]) => {
                const tabularData = getParticipantDataAsDataTableFormat(participantData, studyTask.task.taskType);
                const fileName = `STUDY_${study.id}_INDEX_${studyTask.taskOrder}_TASK_${
                    studyTask.task.name
                }_DATE_${new Date().toLocaleDateString()}`;

                this.fileService.exportAsCSV(tabularData, fileName);
            })
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    downloadAllSnapshots(study: Study) {
        this.fileService.exportAsJSONFile(study.snapshots, `STUDY_${study.id}_SNAPSHOTS`);
    }

    downloadSnapshotForDate(study: Study, dateKey: string) {
        this.fileService.exportAsJSONFile(study.snapshots[dateKey], `STUDY_${study.id}_SNAPSHOT_${dateKey}`);
    }

    @Input()
    set study(study: Study) {
        this._study = study;
        this.dataSource.data = [
            {
                name: 'Study Snapshots',
                clickAction: undefined,
                disabled: Object.keys(study.snapshots).length === 0,
                children: [
                    {
                        name: 'Download all snapshots',
                        disabled: Object.keys(study.snapshots).length === 0,
                        clickAction: () => {
                            this.downloadAllSnapshots(study);
                        },
                        children: [],
                    },
                    ...Object.keys(study.snapshots)
                        .sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())
                        .map((snapshot) => {
                            const date = new Date(snapshot);

                            return {
                                name: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
                                clickAction: () => {
                                    this.downloadSnapshotForDate(study, snapshot);
                                },
                                children: [],
                            };
                        }),
                ],
            },
            {
                name: 'User Data',
                clickAction: undefined,
                children: [
                    {
                        name: 'Download user data for Account Holders',
                        clickAction: () => {
                            this.downloadStudyUserData(study);
                        },
                        children: [],
                    },
                    {
                        name: 'Download user data for Crowdsourced Users',
                        clickAction: () => {
                            this.downloadCrowdsourcedUserData(study);
                        },
                        children: [],
                    },
                ],
            },
            {
                name: 'Task Data',
                clickAction: undefined,
                children: [
                    ...(this._study.studyTasks || []).map((studyTask) => ({
                        name: `Download ${studyTask.task.name} Participant Data`,
                        studyTask: studyTask,
                        clickAction: () => {
                            this.downloadParticipantData(study, studyTask);
                        },
                        children: [],
                    })),
                ],
            },
        ];
    }

    hasChild = (_: number, node: FlatNode) => node.expandable;

    download() {}

    ngOnInit(): void {}
}
