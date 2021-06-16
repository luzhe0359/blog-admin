<template>
  <q-btn flat no-caps no-wrap class="q-ml-xs gt-xs" @click="toFront">
    <q-toolbar-title shrink class="text-weight-bold">
      {{title}}
    </q-toolbar-title>
  </q-btn>
</template>

<script>
export default {
  name: 'ToolbarTitle',
  data () {
    return {
      title: 'ZUGELU'
    }
  },
  methods: {
    toFront () {
      window.open('https://zugelu.com')
    }
  }
}
</script>
