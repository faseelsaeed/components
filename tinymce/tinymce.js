webix.protoUI({
	name:"tinymce-editor",
	defaults:{
		config:{ theme:"modern", statusbar:false },
		value:""
	},
	$init:function(config){
		this.$view.className += " webix_selectable";

		this._waitEditor = webix.promise.defer();
		this.$ready.push(this.render);
	},
	render:function(){
		this._set_inner_size();
	},
	_init_tinymce_once:function(){
		//set id for future usage
		this._mce_id = "webix_mce_"+this.config.id;
		this.$view.innerHTML = "<textarea id='"+this._mce_id+"' style='width:1px; height:1px'></textarea>";

		//path to tinymce codebase
		tinyMCEPreInit = { query:"", base: webix.codebase+"tinymce", suffix:".min" };
		webix.require("tinymce/tinymce.min.js", function(){
			if (!tinymce.dom.Event.domLoaded){
				//woraround event logic in tinymce
				tinymce.dom.Event.domLoaded = true;
				webix.html.addStyle(".mce-tinymce.mce-container{ border-width:0px !important}");
			}
			
			var config = this.config.config;

			config.mode = "exact";
			config.height = 300;
			config.elements = [this._mce_id];
			config.id = this._mce_id;

			var customsetup = config.setup;
			config.setup = webix.bind(function(editor){
				if(customsetup) customsetup(editor);
				this._mce_editor_setup(editor);
			}, this);

			tinyMCE.init(config);

		}, this);

		this._init_tinymce_once = function(){};
	},
	_mce_editor_setup:function(editor){
		editor.on("init", webix.bind(this._mce_editor_ready,this))
	},
	_mce_editor_ready:function(editor){
		this._3rd_editor = tinyMCE.get(this._mce_id);
		this._set_inner_size();
		this._waitEditor.resolve(this._3rd_editor);

		this.setValue(this.config.value);
		if (this._focus_await)
			this.focus();
	},
	_set_inner_size:function(){
		if (!this._3rd_editor || !this.$width) return;
		        this._3rd_editor.theme.resizeTo(this.$width - 2, this.$height);

	       //recalculate menu and toolbar height when width changes
	       //toolbar can become bigger if width is smaller
	       //re-adjust the editor height accordingly


	       var menubarHeight = 0;
	       var toolbarHeight=0;
	       var element = $$(this.config.id);
	       if(!element) return;


	       var c = element.getNode();
	       var toolbar = c.getElementsByClassName('mce-toolbar-grp');
	       var menubar = c.getElementsByClassName('mce-menubar');


	       if(toolbar.length>=1){
		   toolbarHeight = toolbar[0].offsetHeight+1;
	       }
	       if(menubar.length>=1){
		   menubarHeight = menubar[0].offsetHeight;

	       }
	       var h= this.$height-toolbarHeight-menubarHeight-2;
	       this._3rd_editor.theme.resizeTo(this.$width - 2, h);
	},
	$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this, x, y)){
			this._init_tinymce_once();
			this._set_inner_size();
		}
	},
	setValue:function(value){
		this.config.value = value;
		if (this._3rd_editor)
			this._3rd_editor.setContent(value);
	},
	getValue:function(){
		return this._3rd_editor?this._3rd_editor.getContent():this.config.value;
	},
	focus:function(){
		this._focus_await = true;
		if (this._3rd_editor)
			this._3rd_editor.focus();
	},
	getEditor:function(waitEditor){
		return waitEditor?this._waitEditor:this._3rd_editor;
	}
}, webix.ui.view);
