<template>
  <div id="login" class="w-100 h-100">
    <img alt="Vue logo" src="../assets/logo.png">
    <LoginForm msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import LoginForm from '@/components/LoginForm.vue'

export default {
  name: "Login",
  components: {
    LoginForm
  }
}
</script>

<style scoped>
  #login
  {
    display:flex;
    flex-direction: column;
    align-items: center;
  }
</style>