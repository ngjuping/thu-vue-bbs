<template>
    <div :id="`reply${replyId}`" :class="{b4highlight:true,highlighted:ok_highlight}">
        <a class="list-group-item list-group-item-action flex-column">
            <div class="d-flex w-100 justify-content-between replied">
                <a class="list-group-item list-group-item-action text-left replyInReply">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1" v-if="replyToPost">{{ postTitle.slice(0,100) }}</h5>
                        <small class="text-muted" v-if="!replyToPost" v-text="'Created ' + nowReplyTo"></small>
                    </div>
                    <p v-if="replyToPost"> {{ postContent.slice(0,100)+".." }} </p>
                    <p class="mb-1" v-if="!replyToPost">{{ replyTo.content.slice(0,100)+".." }}</p>
                    <small class="text-muted" v-if="!replyToPost">{{ replyTo.nickname }}</small>
                    <a href="#post_top"><small class="text-muted" v-if="replyToPost">View the original post</small></a>
                    <hr>
                    <a v-if="!replyToPost" :href="`#reply${replyTo.id}`" @click="tempBorder(`reply${replyTo.id}`)"><small class="text-muted" >View the original reply</small></a>
                </a>
                <small v-text="'Last updated ' + now"></small>
            </div>
            <hr>
            <div class="text-left">
            <div class="mb-1 reply" style="max-height:400px; overflow-y:scroll;" v-html="content"></div>
            <small>By {{ nickname }}</small>
            </div>
            <hr>
            
            <div class="btn-group" role="group" >
            <button type="button" class="btn btn-light" @click="$emit('click',{replyId})">Reply</button>
            <button type="button" class="btn btn-light" v-if="isOwnerReply" @click="toggleReplyInput">Edit</button>
            <div v-if="showReplyInput" class="input-group">
            <input type="text" class="form-control" v-model="correction">
            <div class="input-group-append">
                <button class="btn btn-light" v-show="submitting" disabled>
                    <span class="spinner-border spinner-border-sm"></span>
                    Submitting...
                </button>
                <button type="button" class="btn btn-outline-secondary" v-show="!submitting" @click="editReply">Submit</button>
                <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"
                :disabled="submitting">
                </button>
                <div class="dropdown-menu">
                <a class="dropdown-item" @click="appendText">Append</a>
                <a class="dropdown-item" @click="appendPic">Add picture</a>
                </div>
            </div>
            </div>   
            
            </div>  
        </a>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import moment from 'moment';

export default {
    name:"Reply",
    props:["nickname","content","latestEdit","replyTo_o","replyId","writerId","postId","postContent","postTitle"],
    data(){
        return {
            showReplyInput:false,
            correction: '',
            submitting: false,
            replyToPost: true,
            ok_highlight: false,
            replyTo:this.replyTo_o
        }
    },
    mounted()
    {
        //if exists a reply that this reply replies to
        if(this.replyTo)
        {
            this.replyToPost = false;
        }
        
    },
    computed:
    {
        isOwnerReply()
        {
            return parseInt(localStorage.getItem('my-id')) === this.writerId;
        },
        now(){

            let first_half = this.latestEdit.split("T")[0];
            let second_half_time = this.latestEdit.split("T")[1].split("+")[0];
            
            return moment(first_half + " " + second_half_time,"YYYY-MM-DD hh:mm:ss").fromNow();

        },
        nowReplyTo()
        {
            let first_half = this.replyTo.created.split("T")[0];
            let second_half_time = this.replyTo.created.split("T")[1].split("+")[0];
            
            return moment(first_half + " " + second_half_time,"YYYY-MM-DD hh:mm:ss").fromNow();
        }
    
    },
    methods:{
        toggleReplyInput()
        {
            this.showReplyInput = !this.showReplyInput;
        },
        editReply()
        {
            this.submitting = true;
            this.$axios.put(
                `/api/v1/post/${this.postId}/reply/${this.replyId}`,
                {
                    content: this.correction
                },
                {
                    headers: {
                    Authorization: localStorage.getItem('my-jwt'),
                    },
                }
            )
            .then(() => {

                this.$emit('reload-replies');
                this.submitting = false;
                this.correction = "";

            })
            .catch((e) => {
                
                console.log("Edit reply failed.");
                console.log(e);
                this.submitting = false;
                
                 Swal.fire({
                    title: "Session expired",
                    text: "Please login again.",
                    icon: "error",
                    timer: 1500});

                this.$router.replace({name:'Login'});
                    
            })
        },
        appendText()
        {
            if(this.correction.length === 0) return;
            this.correction = this.content + this.correction;
            this.editReply();
        },
        appendPic()
        {
            if(this.correction.length === 0) return;
            this.correction = this.content + `<br/><img src= "${ this.correction }">`;
            this.editReply();
        },
        tempBorder(replyToId)
        {
            this.$emit('highlight-reply',replyToId);
        },
        toggleSelf()
        {
            this.ok_highlight = true;
            setTimeout(() => {this.ok_highlight = false}, 1100);
        }
    }
}
</script>
<style>

.reply img{
    max-width:100%;
}

.reply{
    word-wrap:break-word;
}

.replied{
    word-wrap:break-word;
    max-height:400px;
    overflow:hidden;
}

.replyInReply
{
    width:50%;
}

.b4highlight{
    position:relative;
}
.b4highlight::before
{
    content:"";
    position:absolute;
    z-index:2;
    bottom:0px;
    right:0px;
    width:0px;
    height:0px;
    border-bottom:6px solid;
    border-left:6px solid;
    border-color:transparent;
    filter:blur(5px);
}
.b4highlight::after
{
    content:"";
    position:absolute;
    z-index:1;
    top:0px;
    left:0px;
    width:0px;
    height:0px;
    border-top:6px solid;
    border-right:6px solid;
    border-color:transparent;
    filter:blur(5px);
}

.highlighted::after{
    border-color:#a3a3a3;
    width:100%;
    height: 100%;
    transition: width 0.25s,
    height 0.25s 0.25s;
}

.highlighted::before{
    border-color:#a3a3a3;
    width:100%;
    height: 100%;
    transition: width 0.25s 0.5s,
    height 0.25s 0.75s;
}

@media(max-width:768px)
{
    .replyInReply
    {
        width:75%;
    }
}
</style>