<template>
  <!-- 一级评论 -->
  <div :class="!hideCancel && 'q-ml-xl'">
    <q-input label="请留下您的优质评论" type="textarea" v-model="content" maxlength='500' lazy-rules />
    <div class="q-gutter-x-sm q-mt-xs row justify-end ">
      <q-btn v-if="!hideCancel" size="sm" color="primary" label="取消评论" @click="cancelComment" />
      <q-btn size="sm" color="primary" label="发表评论" @click="addComment" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseComment',
  props: {
    hideCancel: { type: Boolean, default: false }
  },
  data () {
    return {
      content: ''
    }
  },
  methods: {
    addComment () {
      this.$emit('comment', this.content)
      this.content = ''
    },
    cancelComment () {
      this.$emit('cancelComment')
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
