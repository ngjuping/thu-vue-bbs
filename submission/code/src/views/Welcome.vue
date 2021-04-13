<template>
  <div class="d-flex align-items-center" style="flex-direction:column;" id="welcome_page">
    <h1 class="w-100">Welcome to Ng's BBS</h1>
    <small>Nice day for fishing ain't it? Hu Hah!</small>
    <hr>
    <div v-if="isGettingPosts">
      <div class="spinner-grow text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-secondary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-success" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-danger" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-warning" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-dark" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div id="menubar" class="d-flex mt-5 table-responsive">
    <div class="pt-1 pagination table-responsive w-75">

        <div class="page-item" :class="{disabled:page<=1||isGettingPosts}"  v-if="!showfav && !showHist">
          <a class="page-link"  @click="updatePosts(0)">&#60;&#60;</a>
        </div>
        
        <div class="page-item" v-if="!showfav && !showHist">
          <div class="spinner-border text-primary" role="status" v-if="isGettingPosts" >
            <span class="sr-only">Loading...</span>
          </div>
          <div class="page-item" v-if="!isGettingPosts">
            
              <select class="page-link" v-model="page" @change="getPosts()" style="text-align-last:center;">
                <option v-for="n in Math.ceil(total/10)" :key="n">{{ n }}</option>
              </select>
          </div>
        </div>

        <div class="page-item" :class="{disabled:ok_next===1}"  v-if="!showfav && !showHist">
          <a class="page-link" @click="updatePosts(1)">&#62;&#62;</a>
        </div>

        <!-- Utilities -->
        <div class="pagination ">
            <div class="page-item light" v-show="!showHist">
              <a class="page-link" @click="showfav = !showfav">
                <b v-if="!showfav" >Favorites</b>
                <b v-if="showfav">Go back</b>
              </a>
            </div>
            <div class="page-item light" v-show="!showfav">
              <a class="page-link" @click="showHist = !showHist">
                <b v-if="!showHist">History</b>
                <b v-if="showHist">Go back</b>
              </a>
            </div>
                
            <div class="page-item light"><a class="page-link" @click="undo">Home</a></div>
        </div>
       
        
    </div>
    <div class="p-1 w-25">
      <button type="button" class="btn btn-outline-secondary table-responsive" @click="filterPosts(-1)">My posts</button>
    </div>
    </div>
    
    <div id="posts">
      <div class="w-100 mt-4"  v-if="showfav && !showHist">
        <h2 v-if="favorite_posts.length === 0">Nothing to show ... </h2>
        <hr>
        <div class="text-right"><button class="btn btn-danger" @click="clearFavorites">Clear Favorites</button></div>
        <br/>

        <Post v-for="post in favorite_posts"
        :key="'fav'+post.id" 
        :ref="`post${post.id}`" 
        :nickname="post.nickname" 
        :historyOrFav="true"
        :title="post.title" 
        :content="post.content"
        :actualContent="post.actualContent"
        :ids="[post.id,post.userId]"
        @view-post-details="wrapper($event.postId,post)"
        @view-user-history="filterPosts($event.userId)"
        @reload-posts="getPosts"
        ></Post>
      </div>

      <div class="w-100 mt-4"  v-if="!showfav && showHist">
        <h2 v-if="history_posts.length === 0">Nothing to show ... </h2>
        <em>The most recently visited post is at the topmost.</em>
        <hr>
        <div class="text-right"><button class="btn btn-danger" @click="clearHistory">Clear history</button></div>
        <br/>
        <Post v-for="post in history_posts"
        :key="'hist'+post.id" 
        :nickname="post.nickname" 
        :historyOrFav="true"
        :title="post.title" 
        :content="post.content"
        :actualContent="post.actualContent"
        :ids="[post.id,post.userId]"
        @view-post-details="wrapper($event.postId,post)"
        @view-user-history="filterPosts($event.userId)"
        @reload-posts="getPosts"
        ></Post>
      </div>

      <div class="w-100 mt-4" v-if="!showfav && !showHist">
        <Post v-for="post in posts" 
        :key="post.id" 
        :ref="`post${post.id}`" 
        :nickname="post.nickname"
        :historyOrFav="false"
        :title="post.title" 
        :content="post.content"
        :actualContent="post.actualContent"
        :ids="[post.id,post.userId]"
        :lastRepliedTime="post.lastRepliedTime"
        @view-post-details="wrapper($event.postId,post)"
        @view-user-history="filterPosts($event.userId)"
        @reload-posts="getPosts"
        ></Post>
      </div>
    </div>
    <WritePost @reload-posts="getPosts"></WritePost>
    <!-- everytime the modal closes the posts are refreshed -->

    <Updated :activate="filtered" notification="Filtered posts" :isMainPage="true"></Updated>
  </div>
</template>

<script>

import Swal from 'sweetalert2';
import Post from '../components/Post.vue';
import WritePost from '../components/WritePost.vue';
import validate_jwt from '../validate_jwt.js'
import Updated from '../components/Updated.vue'
import Vue from 'vue'

export default
{
  name: 'Welcome',
  components: {Post,WritePost,Updated},
  data()
  {
    return{
      validated: false,
      page: 1,
      size: 10,
      userId: 0,
      posts: [],
      favorite_posts:Vue.prototype.favPost,
      history_posts:Vue.prototype.histPost,
      total: 0,
      disableNext:false,
      isGettingPosts:false,
      filtered:false,
      first:true,
      showfav:false,
      showHist:false
    }
  },
  mounted ()
  {
    validate_jwt.validate();
    console.log("validating.");
    this.getPosts();
    
    //listsner for data from post details component
    this.$root.$off("update-history-favorites");
    this.$root.$on('update-history-favorites',function(data){
      console.log("Called update history and fav!")
      let hposts = Vue.prototype.histPost;

      hposts.forEach( (hpost,i) => {
        if(hpost.id === parseInt(data.postId)){
          hposts[i].title = data.title;
          hposts[i].content = data.content;
          hposts[i].actualContent = data.actualContent;
        }
      })

      let fposts = Vue.prototype.favPost;

      fposts.forEach( (fpost,i) => {
        if(fpost.id === data.postId){
          fposts[i].title = data.title;
          fposts[i].content = data.content;
          fposts[i].actualContent = data.actualContent;
          
        }
    })
    });
  
  },
  methods:{
    getPosts(){
      this.isGettingPosts = true;
      return this.$axios
      .get('/api/v1/post', 
      {
        headers: {
        Authorization: localStorage.getItem('my-jwt'),
        },
        params: {
          page: this.page,
          size: this.size,
          userId: this.userId,
          orderByReply:true
        }
        })
      .then(response =>
      {
        this.isGettingPosts = false;

        //update instance data
        this.total = response.data.total;
        this.posts = response.data.posts;
        this.posts.forEach((e) => {
          e.actualContent = e.content,
          e.content = e.content.slice(0,100) + "..."
          })

      })
      .catch((e) => {

          if(e.response.status === 400)
          {
              Swal.fire({
                  title: "Bad request",
                  text: "No data returned",
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
              
              this.$router.replace({name:'Login'});
          }
        });
    },
    wrapper(postId,post)
    {
      this.goToPost(postId);
      this.addToHistory(postId,post);
    },
    goToPost(postId){
      this.$router.push({ path: `/Welcome/${postId}` }) // -> /user/123
    },
    addToHistory(post_id,post)
    {
      
        let hist_arr = this.history_posts;
        let len = hist_arr.length;

        for(let i=0 ; i<len ; i++)
        {
            if(parseInt(hist_arr[i].id) === parseInt(post_id))
            {
                let removed = hist_arr.splice(i,1);
                hist_arr.unshift(removed[0]);
                return;
            }
        }
        console.log("Add new post to history")
        
        let history_post = {
            nickname:post.nickname,
            title:post.title,
            content:post.content,
            actualContent:post.actualContent,
            id:post.id,
            userId:post.userId,
        }

        hist_arr.unshift(history_post);
        
    },
    clearHistory()
    {
      Vue.prototype.histPost = [];
      //reference the same underlying array!
      this.history_posts = Vue.prototype.histPost;

    },  
    clearFavorites()
    {
      Vue.prototype.favPost = [];
      //reference the same underlying array!
      this.favorite_posts = Vue.prototype.favPost;
    },
    updatePosts(id){
      if(id==0){
        if(this.page>1) 
        {
          this.page--;
          this.getPosts();
        }
        this.disableNext = false;
      }
      else{
        if(this.page <= Math.ceil(this.total/10)-1)
        {
          this.page++;
          this.getPosts();
          if(this.page > Math.ceil(this.total/10)-1)
          {
            this.disableNext = true;
          }
        } 
        else
        {
          this.disableNext = true;
        }
      }
    },
    filterPosts(userId)
    {
      if(userId == -1)
      {
        userId = parseInt(localStorage.getItem('my-id'));
        this.showHist = false;
        this.showfav = false;
      }
      this.userId = userId;
      this.page = 1;
      this.getPosts().then(() => {this.filtered = true;setTimeout(()=>{this.filtered = false;},1500)});
      
    },
    undo()
    {
      this.showfav = false;
      this.showHist = false;
      this.userId = 0;
      this.getPosts().then(() => {this.filtered = true;setTimeout(()=>{this.filtered = false;},1500)});
    }
  },
  computed:{
    ok_next()
    {
      return (this.page>Math.ceil(this.total/10))|| this.isGettingPosts || Math.ceil(this.total/10);
    }
  }
}
</script>

<style>
.card-title img{
  max-width:100%;
}
</style>
<style scoped>

#menubar
{
  width:50%;
}

#posts
{
  width:50%;
}
.page-item:hover
{
  cursor: pointer;
}

@media(max-width:1024px)
{
  #posts
  {
    width:60%;
  }
  #menubar
  {
    width:100%;
  }
}

@media(max-width:768px)
{
  #posts
  {
    width:100%;
  }
  #menubar
  {
    width:100%;
  }
}
</style>