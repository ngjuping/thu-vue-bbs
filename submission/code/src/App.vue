<template>
<div>
  <Navbar></Navbar>
  <router-view id="view"></router-view>
</div>
</template>

<script>
import Navbar from './components/Navbar.vue'
export default {
  name: 'App',
  components: {Navbar}
};

</script>

<style scoped>
#view
{
  padding:10%;
  padding-top:2%;
  text-align:center;
  background: rgb(236,236,236);
  background: linear-gradient(90deg, rgba(236,236,236,1) 0%, rgba(217,230,224,1) 70%, rgba(190,204,169,1) 100%);
}

@media(max-width:600px)
{
  #view{
  padding:5%;
  }
}

</style>
