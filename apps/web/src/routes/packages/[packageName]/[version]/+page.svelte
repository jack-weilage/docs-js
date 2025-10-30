<script lang="ts">
import { onMount, onDestroy } from "svelte";
import type { PageData } from "./$types";

const { data }: { data: PageData } = $props();

let buildStatus = $state(data.buildStatus);
let pollInterval: number | undefined = $state(undefined);

async function pollBuildStatus() {
	try {
		const response = await fetch(
			`/api/build-status/${data.packageName}/${data.version}`
		);
		if (response.ok) {
			const result = await response.json();
			buildStatus = result.buildStatus;

			// Stop polling if build is completed or failed
			if (
				buildStatus.status === "completed" ||
				buildStatus.status === "failed"
			) {
				if (pollInterval) {
					clearInterval(pollInterval);
					pollInterval = undefined;
				}
			}
		}
	} catch (error) {
		console.error("Error polling build status:", error);
	}
}

onMount(() => {
	// Only poll if build is not yet completed or failed
	if (
		buildStatus.status === "queued" ||
		buildStatus.status === "running"
	) {
		// Poll every 5 seconds
		pollInterval = setInterval(pollBuildStatus, 5000) as unknown as number;
	}
});

onDestroy(() => {
	if (pollInterval) {
		clearInterval(pollInterval);
	}
});
</script>

<div class="container mx-auto p-8">
	<h1 class="text-3xl font-bold mb-4">
		{data.packageName}@{data.version}
	</h1>

	{#if buildStatus.status === "queued"}
		<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
			<p class="font-bold">Build Queued</p>
			<p>Your documentation build has been queued and will start shortly.</p>
		</div>
	{:else if buildStatus.status === "running"}
		<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
			<p class="font-bold">Build In Progress</p>
			<p>Your documentation is currently being built. This page will update automatically.</p>
		</div>
	{:else if buildStatus.status === "completed"}
		<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
			<p class="font-bold">Build Completed</p>
			<p>Your documentation has been successfully built!</p>
		</div>
	{:else if buildStatus.status === "failed"}
		<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
			<p class="font-bold">Build Failed</p>
			<p>The documentation build failed. Please try again or contact support.</p>
		</div>
	{/if}

	<div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
		<div class="mb-4">
			<h2 class="text-xl font-semibold mb-2">Build Status</h2>
			<div class="flex items-center">
				<span class="font-medium mr-2">Status:</span>
				<span class="px-3 py-1 rounded-full text-sm font-semibold {
					buildStatus.status === 'queued' ? 'bg-blue-200 text-blue-800' :
					buildStatus.status === 'running' ? 'bg-yellow-200 text-yellow-800' :
					buildStatus.status === 'completed' ? 'bg-green-200 text-green-800' :
					'bg-red-200 text-red-800'
				}">
					{buildStatus.status.toUpperCase()}
				</span>
			</div>
		</div>

		{#if buildStatus.steps && buildStatus.steps.length > 0}
			<div class="mb-4">
				<h3 class="text-lg font-semibold mb-2">Build Steps</h3>
				<ul class="list-disc list-inside space-y-1">
					{#each buildStatus.steps as step}
						<li class="text-gray-700">{step}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if buildStatus.updatedAt}
			<div class="text-sm text-gray-600">
				Last updated: {new Date(buildStatus.updatedAt).toLocaleString()}
			</div>
		{/if}
	</div>

	{#if buildStatus.status === "queued" || buildStatus.status === "running"}
		<div class="flex justify-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
		</div>
	{/if}
</div>
