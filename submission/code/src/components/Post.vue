<template>
    <div class="card mb-3 pb-1" style="max-height: 1000px; overflow:hidden">
        <div class="card-body h-100">
            <h5 class="card-title" v-html="title"></h5>
            <h6 class="card-subtitle mb-2 text-muted link btn-link" @click="$emit('view-user-history',{userId})">{{ nickname }}</h6>
            <div class="card-text">{{content}}</div>
            <hr>
            <p v-if="!historyOrFav"><small  v-text="'Last replied ' + now"></small></p>
            <div class="text-right pl-5">
                <a @click="editPost" v-if="isOwnerPost" class="btn btn-primary card-link text-white">Edit</a>
                <a @click="$emit('view-post-details',{postId})" class="btn btn-primary card-link text-white">View more</a>
                
            </div>
        </div>
        <EditPost @reload-posts="$emit('reload-posts');" 
        :launch="permaLaunch" 
        :postId="postId" 
        :oldTitle="title" 
        :oldContent="actualContent"
        ></EditPost>
    </div>
</template>

<script>
import EditPost from '../components/EditPost.vue'
import moment from 'moment';

export default {
    name: "Post",
    props:["title","content","nickname","ids","lastRepliedTime","historyOrFav","actualContent"],
    components: {EditPost},
    data()
    {
        return {
            postId : this.ids[0],
            userId : this.ids[1],
            permaLaunch : false,
        }
        
    },
    methods:{
        editPost()
        {
            //this always triggers the watcher function
            this.permaLaunch = !this.permaLaunch;
        }
    },
    computed:{
    isOwnerPost(){

        let ownerID = parseInt(localStorage.getItem('my-id'));
        return ownerID === this.userId;
    },
    now(){

        let first_half = this.lastRepliedTime.split("T")[0];
        let second_half_time = this.lastRepliedTime.split("T")[1].split("+")[0];
        
        return moment(first_half + " " + second_half_time,"YYYY-MM-DD hh:mm:ss").fromNow();

    },
    }
}
</script>

<style scoped>
.card-subtitle:hover
{
    cursor:pointer;
}
</style>