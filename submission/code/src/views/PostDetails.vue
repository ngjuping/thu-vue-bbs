<template>
    <div>
        <div id="post_top"></div>
        <h1>Post {{post_id}} </h1>
        <div class="jumbotron p-4 bg-light" >
            <div class="text-right">
                <small> Last activity {{ last_replied_time }} </small>
            </div>
            <h1 class="display-4 " v-html="post_title"></h1>
            <div class="lead text-center" v-html="post_content"></div>
            
            <div class="text-right"><small >By {{ post_owner }}</small></div>
            <hr class="my-4">
            
        </div>
        <div class="spinner-border text-primary" role="status" v-if="filtering || loading_replies">
            <span class="sr-only"></span>
        </div>
        <div class="d-flex justify-content-end align-items-center" v-if="!loading_replies">
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-danger" @click="$router.replace({path:'../Welcome'});" > Go back to BBS </button>
                <button type="button" class="btn btn-outline-primary" v-if="!filteredOwnerOnly" @click="filterPosts"  :disabled="filtering" > Show owner only </button>
                
                <button type="button" class="btn btn-outline-primary" v-if="filteredOwnerOnly" @click="undoFilter" :disabled="filtering"> Undo filter </button>
                <button type="button" class="btn btn-outline-secondary" @click="addFav" :disabled="disable_like">
                    <em v-if="disable_like">Saved to your favorites!</em>
                    <em v-if="!disable_like">Save as favorites &#128151;</em>
                </button>
            </div>
        </div>
        <br/>
        <p class="lead text-right">
            <a class="btn btn-primary text-white btn-lg" @click="createReply(0)" role="button" :disabled="loading_replies">Reply to {{ post_owner }}</a>
        </p>
        <div class="list-group d-flex flex-column align-items-center">
            <Reply class="w-100 mb-4"
            @highlight-reply="highlightReply($event)"
            v-for="(reply,index) in post_replies" :key="reply.id" 
            v-show="myTurn[index] === true"
            :ref="`reply${reply.id}`" 
            :nickname="reply.nickname"
            :content="reply.content"
            :latestEdit="reply.updated"
            :replyTo_o="post_replies_replyTo[index]" 
            :replyId="reply.id"
            :writerId="reply.userId"
            :postId="post_id"
            :postContent="post_content"
            :postTitle="post_title"
            @click="createReply($event.replyId)"
            @reload-replies="getPostReplies(true)"
            >
            </Reply>
            <p class="display-5" v-if="post_replies.length > nextReply">Scroll for more replies</p>
            <p class="display-4" v-if="post_replies.length === nextReply">End of replies</p>
        </div>
        <br/>
        <WriteReply 
        :postId="post_id" 
        :replyToID="to_be_replied_id"
        @reload-replies="getPostReplies(true)"
        @reply-created="modifyScrollList"></WriteReply>
        
        <div v-if="post_replies.length===0">
            <hr>
            <h2 class="lead"> No replies yet... </h2>
            <hr>
        </div>
        <div class="btn-group" role="group" v-if="post_replies.length!==0">
            <button type="button" class="btn btn-outline-danger" @click="$router.replace({path:'../Welcome'});" > Go back to BBS </button>
            <button class="btn btn-outline-primary" @click="createReply(0)">
                Reply to {{ post_owner }}
            </button>
            
        </div>
        <!-- everytime the modal closes the replies are refreshed -->
        <Updated :activate="updated" notification="Updated replies" :isMainPage="false"></Updated>
    </div>
    
</template>

<script>
import $ from 'jquery';
import Swal from 'sweetalert2';
import validate_jwt from '../validate_jwt.js'
import Reply from '../components/Reply.vue'
import WriteReply from '../components/WriteReply.vue'
import Updated from '../components/Updated.vue'
import moment from 'moment';
import Vue from 'vue'

export default {
    name:"PostDetails",
    components: {Reply,WriteReply,Updated},
    data()
    {
        return {
            post_id: this.$route.params.postId,
            post_title: '',
            post_content: '',
            post_replies: [],
            post_replies_replyTo: [],
            post_owner: '',
            post_owner_id: '',
            last_replied_time: '',
            to_be_replied_id: 0,
            filteredOwnerOnly:false,
            updated: false,
            disable_like: false,
            filtering:false,
            loading_replies: true,
            scrolledToBottom:false,
            myTurn:[],
            nextReply:1,
        }
    },
    watch:{
        scrolledToBottom:function(){
            if(this.nextReply >= this.post_replies.length) return;
            Vue.set(this.myTurn, this.nextReply, true)
            this.scrolledToBottom = false;
            this.nextReply++;
        }
    },
    methods:{
        scroll () {
            /*window.onscroll = () => {
                let bottomOfWindow = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight === document.documentElement.offsetHeight

                if (bottomOfWindow) {
                this.scrolledToBottom = true // replace it with your code
                }
            }*/
            //console.log(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight === document.documentElement.offsetHeight);
            $(window).scroll(() => {
                if(Math.ceil($(window).scrollTop() + $(window).height()) == $(document).height()) {
                    this.scrolledToBottom = true;
                }
            });
        },
        getPostReplies(triggeredByReply=false){
            return this.$axios
            .get(`/api/v1/post/${this.post_id}`, {
                headers: {
                Authorization: localStorage.getItem('my-jwt'),
                },
            })
            .then(response =>
            {
                let data = response.data;
                
                this.post_title = data.title;
                this.post_content = data.content;
                this.post_replies = data.reply.reverse();
                let reply_count = data.reply.length;
                this.last_replied_time = data.lastRepliedTime;
                
                this.$root.$emit('update-history-favorites',{
                    postId:parseInt(this.post_id),
                    title:data.title, 
                    content:data.content.slice(0,100),
                    actualContent:data.content
                });

                this.post_replies.forEach((post,index) => {
                    for(let i=index+1 ; i<reply_count ; i++)
                    {
                        let newobj = null;
                        //default replies to original post
                        let reversed_post_replies = this.post_replies;
                        
                        if(reversed_post_replies[i].id === post.replyId)
                        {
                            newobj = reversed_post_replies[i];
                            this.post_replies_replyTo[index] = newobj;
                            break;
                        }
                        else
                        {
                            this.post_replies_replyTo[index] = null;
                        }
                        
                        

                    }
                });
                this.post_owner = data.nickname;
                this.post_owner_id = data.userId;

            })
            .then(() => {
                this.loading_replies = false;
                this.last_replied_time = this.now;
                this.filtering = false;
                this.updated = true;

                setTimeout(()=>{this.updated = false;},1500)
                console.log("Updated replies for this post");
                if(!triggeredByReply)
                {
                    
                    this.myTurn = new Array(this.post_replies.length).fill(false);
                    this.myTurn[0] = true;
                    this.nextReply = 1;
                    this.scrolledToBottom = false;
                }
                else
                {
                    console.log("Do nothing pls");
                }
                
            })
            .catch((e) => {
                if(e.response)
                {
                    //bad request
                    if(e.response.status === 400)
                    {
                        Swal.fire({
                            title: "Bad request",
                            text: "Page not existent.",
                            icon: "warning",
                            timer: 1500});
                        this.$router.replace({name:'404page'});
                    }
                    else
                    {
                        console.log("Failed to get replies.");
                        this.$router.replace({name:'Login'});

                        Swal.fire({
                            title: "Token error",
                            text: "Sorry, please log in again.",
                            icon: "warning",
                            timer: 1500});
                    }
                }
                
                });
                },
        createReply(replyId)
        {
            this.to_be_replied_id = replyId;
            $('#create_reply_modal').modal('show');
        },
        filterPosts()
        {
            this.scrolledToBottom = false;
            this.filteredOwnerOnly = true;
            for(let i=1 ; i<this.nextReply ; i++)
            {
                Vue.set(this.myTurn, i, false);
            }
            
            this.nextReply = 1;

            let new_reply_list = [];
            this.post_replies.forEach((reply) => {
                if(reply.userId == this.post_owner_id)
                {
                    new_reply_list.push(reply);
                }
            });
            this.post_replies = new_reply_list;
            
            this.updated = true;
            setTimeout(()=>{this.updated = false;},1500)
        },
        undoFilter()
        {
            this.scrolledToBottom = false;
            this.filtering = true;
            this.filteredOwnerOnly = false;
            this.getPostReplies();
        },
        addFav()
        {
            this.disable_like = true;
            let fav_post_arr = Vue.prototype.favPost;
            let len = fav_post_arr.length;
            for(let i=0 ; i<len ; i++)
            {
                if(parseInt(fav_post_arr[i].id) === parseInt(this.post_id))
                {
                    return;
                }
            }
            
            console.log("add to favorites")
            let fav_post = {
                nickname:this.post_owner,
                title:this.post_title,
                actualContent:this.post_content,
                content:this.post_content.slice(0,100) + "...",
                id:parseInt(this.post_id),
                userId:this.post_owner_id,
            }
            console.log("new fav post");
            console.log(fav_post);

            fav_post_arr.push(fav_post);
        },
        highlightReply(data)
        {
            this.loading_replies = true;
            //show all posts for effective referencing
            let reply_len = this.post_replies.length;
            for(let i=this.nextReply ; i<reply_len ; i++)
            {
                Vue.set(this.myTurn, i, true);
            }
            this.nextReply = reply_len;
            this.$refs[data][0].toggleSelf();
            this.loading_replies = false;
        },
        modifyScrollList()
        {
            Vue.set(this.myTurn, this.nextReply, true);
            this.nextReply++;
        }
    },
    
    mounted()
    {
        validate_jwt.validate();
        this.getPostReplies();
        let fav_post_arr = Vue.prototype.favPost;
        fav_post_arr.forEach((post) => {if(parseInt(post.id) === parseInt(this.post_id)){
            console.log("Same post in fav");
            this.disable_like = true;
            }
        })
        
        this.scroll();
    },

    computed:{
        now(){
        let first_half = this.last_replied_time.split("T")[0];
        let second_half_time = this.last_replied_time.split("T")[1].split("+")[0];
        return moment(first_half + " " + second_half_time,"YYYY-MM-DD hh:mm:ss").fromNow();
        }
    }
}
</script>

<style>
/*For dynamically created elements*/
.jumbotron img
{
    max-width:100%;
}
</style>

<style scoped>
.jumbotron{
    max-height:50vh;
    overflow-y:scroll;
    overflow-x:hidden;
}


ul {
   list-style-position: inside;
}


</style>