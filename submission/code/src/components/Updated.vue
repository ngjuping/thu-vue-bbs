<template>
      <div class="text-center ma-2">
        
        <v-snackbar
          v-model="snackbar"
          timeout="1500"
        >
          {{ text }}

          <template v-slot:action="{ attrs }">
            <v-btn v-if="!isMainPage"
              color="white"
              text
              v-bind="attrs"
              href="#post_top"
              @click="snackbar = false"
            >
              Go to top
            </v-btn>

            <v-btn v-if="isMainPage"
              color="white"
              text
              v-bind="attrs"
              @click="snackbar = false"
            >
              Close
            </v-btn>
          </template>

          
        </v-snackbar>
      </div>
</template>

<script>
export default {
    name:"Updated",
    props:["activate","notification","isMainPage"],
    data()
    {
        return{
            text: this.notification,
            snackbar: this.activate
        }
    },
    methods:
    {
      update_snackbar(val)
      {
        this.snackbar = val;
      }
    },
    watch:
    {
      activate:function(newv)
      {
        this.update_snackbar(newv);
      }
    }
}
</script>