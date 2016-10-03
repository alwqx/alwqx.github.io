var vm = new Vue({
	el: '#msgSection',
	data: {
		newMsg:'',
		msgs:[{text:'hello adolphlwq'}]
	},
	methods: {
		addMsg: function(){
			console.log('call addMsg')
			var msg = this.newMsg.trim()
			console.log(msg)
			if(msg){
				this.msgs.push({text:msg})
				this.newMsg = ''
			}
		}
	}
})
