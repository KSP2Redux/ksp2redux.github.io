export const latestVersion = 'v0.2.3 Beta 5 Hotfix 2';
export const releaseDate = '2026-04-28';

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
	bugFixCount: 148,
	performanceCount: 34,
};

export const roadmapMilestones: RoadmapMilestone[] = [
	{
		id: 'stage-0',
		label: 'Stage 0',
		title: 'Foundation',
		status: 'current',
		summary:
			'Redux is still in its foundation phase. Right now the work is mostly about making the game more stable, user-friendly, and easier to build on.',
		sections: [
			{
				title: 'Performance first',
				summary:
					'This stage includes a lot of rendering, simulation, and memory work that needs to be in a better state before larger systems make sense.',
			},
			{
				title: 'Fixing the game\'s rough edges',
				summary:
					'It also means dealing with the bugs that make KSP2 unreliable: flight issues, broken UI behavior, mission logic problems, map view errors, etc.',
			},
			{
				title: 'Prepare the systems that later stages depend on',
				summary:
					'Some of the work here directly translates into later stages, including heat, vessel ISRU, tech tree changes, and a more usable modding workflow in the Unity editor.',
			},
		],
	},
	{
		id: 'stage-1-1',
		label: 'Stage 1.1',
		title: 'Orbital Colonies',
		status: 'planned',
		summary:
			'The first colony step is planned around orbital construction, station infrastructure, and the systems needed to support larger operations off-world.',
		sections: [
			{
				title: 'Orbital infrastructure',
				summary:
					'The goal here is to add orbital colony parts and stations that work as actual construction and support hubs rather than just parked vessels.',
			},
			{
				title: 'Exploration mode resource rules',
				summary:
					'In Exploration mode, orbital colonies are meant to connect different locations and handle resource sharing across that network.',
			},
			{
				title: 'Power planning',
				summary:
					'This stage also needs clearer power planning once stations start carrying more systems and production equipment.',
			},
		],
	},
	{
		id: 'stage-1-2',
		label: 'Stage 1.2',
		title: 'Planetary Colonies',
		status: 'planned',
		summary:
			'After the orbital work, the next step is surface colonies: bases on planets and moons, local production, and the management layer that goes with them.',
		sections: [
			{
				title: 'Surface bases',
				summary:
					'Players should be able to found colonies on planets and moons, then grow them with mining, processing, factories, and launch infrastructure.',
			},
			{
				title: 'Frontier mode',
				summary:
					'This is also where Frontier mode starts to take clearer shape, with more focus on what colonies can actually produce and sustain.',
			},
			{
				title: 'Colony management',
				summary:
					'The colony UI needs to cover resources, power, and heat in a way that is understandable without trial and error.',
			},
		],
	},
	{
		id: 'stage-1-3',
		label: 'Stage 1.3',
		title: 'Supply Routes and Environment',
		status: 'planned',
		summary:
			'Once colonies exist, they still need logistics, environmental constraints, and hardware that fits that scale.',
		sections: [
			{
				title: 'Supply routes',
				summary:
					'The idea here is to turn flown cargo routes into repeatable supply lines so colonies can support each other without every transfer being manual.',
			},
			{
				title: 'Environmental heat',
				summary:
					'Heat and environment are meant to matter more here, so colony placement is not only a visual choice.',
			},
			{
				title: 'Additional content',
				summary:
					'This stage also leaves room for more missions, science content, and heavier hardware suited to moving resources around the Kerbol system.',
			},
		],
	},
	{
		id: 'stage-2',
		label: 'Stage 2',
		title: 'Interstellar',
		status: 'planned',
		summary:
			'After the colony work is in place, the roadmap moves beyond the Kerbol system.',
		sections: [
			{
				title: 'To the stars',
				summary:
					'The Debdeb system is planned as the first destination outside Kerbol, with its own worlds, resources, and challenges. More star systems will be added during the rest of the roadmap as well.',
			},
			{
				title: 'Interstellar hardware',
				summary:
					'That stage also needs hardware to match, so it includes the parts and propulsion systems needed for interstellar travel.',
			},
		],
	},
	{
		id: 'stage-3',
		label: 'Stage 3',
		title: 'Multiplayer',
		status: 'planned',
		summary:
			'The long-term goal is multiplayer, with shared progress and cooperative or competitive play.',
		sections: [
			{
				title: 'Shared progress',
				summary:
					'The main idea is that multiple players can share one agency and work toward the same goals.',
			},
			{
				title: 'Cooperative or competitive play',
				summary:
					'Colonies, logistics, and exploration all change once other people can help with them or interfere with them.',
			},
		],
	},
];

export const roadmapFeatureGroups: RoadmapFeatureGroup[] = [
	{
		id: 'flight-and-feel',
		title: 'Flight and map view reliability',
		summary:
			'A lot of work has already gone into flight reliability, map view behavior, and the kinds of errors that can ruin an otherwise normal mission.',
		bullets: [
			'Map view and camera behavior have been cleaned up in a lot of frustrating edge cases.',
			'SAS, warp handling, targeting, and vessel state changes have all seen practical fixes.',
			'Long missions benefit from fewer surprises and better feedback while you are actually piloting.',
		],
	},
	{
		id: 'ui-and-qol',
		title: 'User interface improvements',
		summary:
			'Some of the most noticeable work is in making the game easier to read and use in the VAB, menus, map view, and Redux-specific UI.',
		bullets: [
			'There is now an in-game bug reporter, better search in the part picker, and more consistent UI styling.',
			'Redux has added things like an improved color manager with presets, better orbital info panel, better notifications, and cleaner loading flows.',
			'We are also gradually working on unifying the UI style and replacing the inconsistent stock UI with our own versions.',
		],
	},
	{
		id: 'content-and-presentation',
		title: 'New content',
		summary:
			'Even at this stage, the work is not limited to fixes. New missions, parts, and visual changes have already been added.',
		bullets: [
			'New radiators, SM+ parts, updated tech tree, and extra missions have been added to the game.',
			'Visual improvements include better clouds, sun flares, reentry colors for different planets, and EVA helmet lights.',
			'Additional improvements include things like custom flags and statistics.',
		],
	},
	{
		id: 'modding-and-ecosystem',
		title: 'Modding and infrastructure',
		summary:
			'A big part of the project is making it easier to create and maintain mods for the game.',
		bullets: [
			'We have upgraded the game\'s Unity engine version from 2022.3 to 6.4+ and our Redux SDK lets modders make full use of Unity\'s features.',
			'Project Shakespeare is an experimental KSP1 part mod loader, which serves as a preview for our future comprehensive editor tooling for helping KSP1 modders port their parts to KSP2 Redux.',
			'Our crossplatform Updater app reduces the amount of setup and maintenance work around the game.',
		],
	},
];

export const roadmapCurrentMilestoneId =
	roadmapMilestones.find((milestone) => milestone.status === 'current')?.id ?? roadmapMilestones[0].id;
