<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import { withBase } from 'vitepress'
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-before>
      <img :src="withBase('/metis-icon.png')" alt="" width="32" height="32" style="margin-right: 10px; border-radius: 7px" />
    </template>
    <template #nav-bar-content-after>
      <a class="tl-download" href="https://github.com/hdoria/metis">GitHub</a>
    </template>
  </DefaultTheme.Layout>
</template>
