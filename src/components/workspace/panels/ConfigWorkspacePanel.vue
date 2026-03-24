<script setup>
import InstrumentConfigurator from "@/components/config/InstrumentConfigurator.vue";
import ScaleBuilder from "@/components/config/ScaleBuilder.vue";
import ConfigFretboardControls from "@/components/fretboard/config/ConfigFretboardControls.vue";

const emit = defineEmits(["open-interval-helper", "go-to-focus"]);
</script>

<template>
  <div class="mx-auto mb-10 mt-4 w-full max-w-screen-2xl px-5">
    <div
      class="rounded-4xl border border-zinc-400/80 bg-zinc-950/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
    >
      <div
        class="rounded-[1.7rem] bg-linear-to-br from-zinc-800/95 via-zinc-800/92 to-zinc-900/92 text-gray-50"
      >
        <div class="border-b border-zinc-600/80 px-6 py-5">
          <p
            class="text-xs font-semibold uppercase tracking-[0.26em] text-rose-200/80"
          >
            Workspace Setup
          </p>
        </div>

        <div class="border-b border-zinc-600/80 px-4 py-5 xl:px-6 xl:py-6">
          <div
            class="rounded-[1.6rem] border border-zinc-700/75 bg-linear-to-br from-zinc-900/80 via-zinc-900/68 to-zinc-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div class="border-b border-zinc-700/70 pb-4">
              <p
                class="inline-flex rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
              >
                Step 1 / Note Naming
              </p>
            </div>

            <div class="mt-5">
              <ConfigFretboardControls embedded />
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-[clamp(31.5rem,43vw,38rem)_minmax(0,1fr)] divide-x divide-zinc-600/80"
        >
          <div class="min-w-0 px-3 py-4 lg:px-4 lg:py-5 xl:px-6 xl:py-6">
            <div
              class="h-full rounded-[1.6rem] border border-zinc-700/75 bg-linear-to-br from-zinc-900/80 via-zinc-900/68 to-zinc-950/55 p-4 lg:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div class="border-b border-zinc-700/70 pb-4">
                <p
                  class="inline-flex w-fit rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
                >
                  Step 2 / Instrument Setup
                </p>
              </div>

              <div class="mt-5">
                <InstrumentConfigurator embedded />
              </div>
            </div>
          </div>
          <div class="min-w-0 px-3 py-4 lg:px-4 lg:py-5 xl:px-6 xl:py-6">
            <div
              class="h-full rounded-[1.6rem] border border-zinc-700/75 bg-linear-to-br from-zinc-900/80 via-zinc-900/68 to-zinc-950/55 p-4 lg:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div class="border-b border-zinc-700/70 pb-4">
                <p
                  class="inline-flex w-fit rounded-full border border-rose-400/35 bg-rose-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100"
                >
                  Step 3 / Scale Setup
                </p>
              </div>

              <div class="mt-5">
                <ScaleBuilder
                  embedded
                  @open-interval-helper="emit('open-interval-helper')"
                  @go-to-focus="emit('go-to-focus')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
