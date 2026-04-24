// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import tailwindcss from '@tailwindcss/vite';
import rewriteLfsVideos from './src/integrations/rewrite-lfs-videos.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://ksp2redux.github.io',
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		starlight({
			plugins: [starlightBlog({
				authors: {
					redux: {
						name: 'Redux Team',
						title: 'Developers of KSP2 Redux',
						picture: 'https://styles.redditmedia.com/t5_g4hm02/styles/communityIcon_rvtruzn4i47g1.png?width=128&frame=1&auto=webp&s=383d92582a7abb7f0a010604ed9625807cc24f82',
					}
				}
			})],
			title: 'KSP2 Redux',
			favicon: '/favicon.ico',
			logo: {
				src: './src/assets/logo.png',
				alt: 'KSP2 Redux Logo',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KSP2Redux/Redux' }],
			// Custom CSS for theming
			customCss: [
				'./src/styles/global.css',
			],
			// Component overrides for unified branding
			components: {
				Header: './src/components/Header.astro',
				Footer: './src/components/Footer.astro',
			},
			sidebar: [
				{
					label: 'Getting Started',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'Modding Documentation',
					link: 'https://modding.ksp2redux.org',
				}
			],
			expressiveCode: {
				themes: ['starlight-dark']
			}
		}),
		rewriteLfsVideos(),
	],
});
