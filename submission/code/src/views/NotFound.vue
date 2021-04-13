<template>
    <div class="jumbotron mb-0">
        <h1 class="display-4">Can't find the page you are requesting for.</h1>
        <a class="lead" @click="$router.replace({name:'Welcome'})">Take me to the home page!</a>
        <hr class="my-4">
        <p class="lead">"The best way to predict the future is to create it." —— Peter Drucker</p>
    </div>
</template>

<script>
export default {
    name: 'NotFound',
}
</script>

<style scoped>
a:hover
{
    cursor: pointer;
}
</style>