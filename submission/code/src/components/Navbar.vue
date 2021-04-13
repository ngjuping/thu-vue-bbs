<template>
    <nav class="navbar navbar-light bg-light" id="top">
      <a class="navbar-brand" href="/login">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tsinghua_University_Logo.svg/1200px-Tsinghua_University_Logo.svg.png" width="60" height="60" class="d-inline-block align-top" alt="">
        
      </a>
      <button class="btn btn-danger" @click="clearData" v-if="$route.name !== 'Login'">Logout</button>
    </nav>
</template>

<script>
export default {
    name:"Navbar",
    methods:{
        clearData(){
            this.$router.replace({name:'Login'});
            localStorage.removeItem('my-jwt');
            localStorage.removeItem('my-nickname');
            localStorage.removeItem('my-id');
        }
    }
}
</script>