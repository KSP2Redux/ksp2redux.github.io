import { t, type MessageKey } from '../i18n';

export const latestVersion = '0.2.8.5';
export const releaseDate = '2026-06-30';

export type RoadmapMilestoneStatus = 'current' | 'planned';

export interface RoadmapMilestoneSection {
	title: string;
	summary: string;
}

export interface RoadmapMilestone {
	id: string;
	label: string;
	title: string;
	status: RoadmapMilestoneStatus;
	summary: string;
	note?: string;
	sections: RoadmapMilestoneSection[];
}

export interface RoadmapFeatureGroup {
	id: string;
	title: string;
	summary: string;
	bullets: string[];
}

export interface RoadmapStats {
	bugFixCount: number;
	performanceCount: number;
}

export const roadmapStats: RoadmapStats = {
	bugFixCount: 408,
	performanceCount: 122,
};

// The text of every milestone and feature group lives in the string catalog under
// `roadmap.milestones.<id>.*` and `roadmap.features.<id>.*`. Only the structure is kept here.
const milestoneDefinitions: { id: string; status: RoadmapMilestoneStatus; sectionCount: number }[] = [
	{ id: 'stage-0', status: 'current', sectionCount: 3 },
	{ id: 'stage-1-1', status: 'planned', sectionCount: 3 },
	{ id: 'stage-1-2', status: 'planned', sectionCount: 3 },
	{ id: 'stage-1-3', status: 'planned', sectionCount: 3 },
	{ id: 'stage-2', status: 'planned', sectionCount: 2 },
	{ id: 'stage-3', status: 'planned', sectionCount: 2 },
];

const featureGroupDefinitions: { id: string; bulletCount: number }[] = [
	{ id: 'flight-and-feel', bulletCount: 6 },
	{ id: 'ui-and-qol', bulletCount: 5 },
	{ id: 'content-and-presentation', bulletCount: 6 },
	{ id: 'modding-and-ecosystem', bulletCount: 5 },
];

const count = (length: number) => Array.from({ length }, (_, index) => index + 1);

export function getRoadmapMilestones(locale: string): RoadmapMilestone[] {
	return milestoneDefinitions.map(({ id, status, sectionCount }) => {
		const text = (field: string) => t(locale, `roadmap.milestones.${id}.${field}` as MessageKey);
		return {
			id,
			label: text('label'),
			title: text('title'),
			status,
			summary: text('summary'),
			sections: count(sectionCount).map((number) => ({
				title: text(`sections.${number}.title`),
				summary: text(`sections.${number}.summary`),
			})),
		};
	});
}

export function getRoadmapFeatureGroups(locale: string): RoadmapFeatureGroup[] {
	return featureGroupDefinitions.map(({ id, bulletCount }) => {
		const text = (field: string) => t(locale, `roadmap.features.${id}.${field}` as MessageKey);
		return {
			id,
			title: text('title'),
			summary: text('summary'),
			bullets: count(bulletCount).map((number) => text(`bullets.${number}`)),
		};
	});
}

export const roadmapCurrentMilestoneId =
	milestoneDefinitions.find((milestone) => milestone.status === 'current')?.id ?? milestoneDefinitions[0].id;
