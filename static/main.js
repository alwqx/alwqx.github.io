var vm = new Vue({
	el: '#msgSection',
	data: {
		newMsg:'',
		msgs:[{text:'hello adolphlwq'}],
		btnObj: {
			'btn': true,
			'btn-default': false,
			'btn-primary': true,
			'btn-success': false,
			'btn-info': false,
			'btn-warning': false,
			'btn-danger': false
		}
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
