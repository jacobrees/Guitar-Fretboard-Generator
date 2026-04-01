<script setup>
import { computed } from "vue";

import { usePlaybackStore } from "@/stores/playback";

const playback = usePlaybackStore();

const fadeOutLabel = computed(() =>
  playback.fadeOutMs >= 1000
    ? `${(playback.fadeOutMs / 1000).toFixed(
        playback.fadeOutMs % 1000 === 0 ? 0 : 1,
      )}s`
    : `${playback.fadeOutMs}ms`,
);

const volumeLabel = computed(() => `${playback.volume}%`);
</script>

<template>
  <div class="px-4 pb-4 pt-4 text-gray-100">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
          Playback Controls
        </p>
        <p class="mt-1 text-sm text-gray-300">
          Tap notes to play. One note can stay active per string.
        </p>
        <p v-if="!playback.hasAudioSupport" class="mt-2 text-xs text-rose-200">
          Audio playback is unavailable in this browser.
        </p>
      </div>

      <button
        type="button"
        class="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        :class="
          playback.hasActiveNotes
            ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:bg-white'
            : 'cursor-not-allowed bg-zinc-800 text-gray-500'
        "
        :disabled="!playback.hasActiveNotes"
        @click="playback.stopAll()"
      >
        Stop All
      </button>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
      <section
        class="rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Tone</p>
        <div
          class="mt-3 inline-flex rounded-xl border border-zinc-700/90 bg-zinc-900/90 p-1"
          role="group"
          aria-label="Playback tone"
        >
          <button
            v-for="option in playback.toneOptions"
            :key="option.id"
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            :class="
              playback.tone === option.id
                ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                : 'text-gray-300 hover:bg-zinc-800 hover:text-gray-100'
            "
            @click="playback.setTone(option.id)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section
        class="rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            Playback Style
          </p>
          <span class="text-xs font-semibold text-gray-300">
            {{
              playback.playStyle === "fade"
                ? fadeOutLabel
                : "Infinite sustain"
            }}
          </span>
        </div>

        <div class="mt-3 grid gap-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
          <div
            class="inline-flex w-fit rounded-xl border border-zinc-700/90 bg-zinc-900/90 p-1"
            role="group"
            aria-label="Playback style"
          >
            <button
              v-for="option in playback.playStyleOptions"
              :key="option.id"
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              :class="
                playback.playStyle === option.id
                  ? 'bg-zinc-100 text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                  : 'text-gray-300 hover:bg-zinc-800 hover:text-gray-100'
              "
              @click="playback.setPlayStyle(option.id)"
            >
              {{ option.label }}
            </button>
          </div>

          <div
            :class="[
              'rounded-xl border border-zinc-700/80 bg-zinc-900/65 px-3 py-3 transition-opacity',
              playback.playStyle === 'fade' ? 'opacity-100' : 'opacity-55',
            ]"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs uppercase tracking-[0.18em] text-gray-400">
                Fade Time
              </p>
              <span class="text-xs font-semibold text-gray-300">
                {{ fadeOutLabel }}
              </span>
            </div>

            <input
              type="range"
              min="150"
              max="4000"
              step="50"
              class="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-200"
              :disabled="playback.playStyle !== 'fade'"
              :value="playback.fadeOutMs"
              aria-label="Fade out time"
              @input="playback.setFadeOutMs($event.target.value)"
            />
          </div>
        </div>
      </section>

      <section
        class="rounded-[1.35rem] border border-zinc-600/75 bg-zinc-950/75 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            Volume
          </p>
          <span class="text-xs font-semibold text-gray-300">
            {{ volumeLabel }}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          class="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-200"
          :value="playback.volume"
          aria-label="Playback volume"
          @input="playback.setVolume($event.target.value)"
        />
      </section>
    </div>
  </div>
</template>
