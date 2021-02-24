<template>
<div>
	<button @click="$emit('update:a', 100)">1</button>
	<button @click="$emit('change', 100)">2</button>
</div>
</template>

<script type="text/ecmascript-6">
       export  default {
            name:  "Demo",
	     props: ["a","b"],
	    model: {
                    prop: "b",
		    event: 'change'
	    },
	     data() {
                    return{

                    }
	     }
       }
</script>

<style>

</style>