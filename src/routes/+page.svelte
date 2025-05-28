<script lang="ts">
	import { game } from '$lib/game';

	function gameAction(node: HTMLCanvasElement) {
		const gameInstance = new game(node);

		return {
			destroy() {
				gameInstance.destroy();
			}
		};
	}
</script>

<div class="absolute inset-0 m-10 flex items-center justify-center">
	<canvas
		width="1920"
		height="1080"
		use:gameAction
		class="h-auto w-full border-2 border-fuchsia-200 bg-blue-950 shadow-[1px_1px_30px_1px] shadow-fuchsia-400"
	></canvas>
</div>
