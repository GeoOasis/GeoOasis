<script setup lang="ts">
import ToolsBar from './tools/ToolsBar.vue'

</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>GeoCollab</el-header>
      <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-main>
          Cesium
        </el-main>
      </el-container>
    </el-container>
    <tools-bar></tools-bar>
  </div>
</template>

<style scoped>
</style>
