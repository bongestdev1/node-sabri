function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var l=t[n];l.enumerable=l.enumerable||!1,l.configurable=!0,"value"in l&&(l.writable=!0),Object.defineProperty(e,l.key,l)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}(window.webpackJsonp=window.webpackJsonp||[]).push([[213],{R6G3:function(e,t,n){"use strict";n.r(t);var l,a,i=n("ofXK"),r=n("tyNb"),o=n("fXoL"),m=n("/n7v"),s=n("+Ai/"),p=[{path:"",component:(l=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"ngOnInit",value:function(){}}]),e}(),l.\u0275fac=function(e){return new(e||l)},l.\u0275cmp=o["\u0275\u0275defineComponent"]({type:l,selectors:[["app-basic-alert"]],decls:89,vars:4,consts:[[1,"row"],[1,"col-sm-12"],["cardTitle","Basic Alert",3,"options"],["type","primary"],["type","secondary"],["type","success"],["type","danger"],["type","warning"],["type","info"],["type","light"],["type","dark"],[1,"col-md-6"],["cardTitle","Link Alert",3,"options"],["href","javascript:",1,"alert-link"],["cardTitle","Dismissing",3,"options"],["type","primary","dismiss","true"],["type","secondary","dismiss","true"],["type","success","dismiss","true"],["type","danger","dismiss","true"],["type","warning","dismiss","true"],["type","info","dismiss","true"],["type","light","dismiss","true"],["type","dark","dismiss","true"],["cardTitle","Additional Content",3,"options"],[1,"alert-heading"],[1,"mb-0"]],template:function(e,t){1&e&&(o["\u0275\u0275elementStart"](0,"div",0),o["\u0275\u0275elementStart"](1,"div",1),o["\u0275\u0275elementStart"](2,"app-card",2),o["\u0275\u0275elementStart"](3,"app-alert",3),o["\u0275\u0275text"](4,"A simple primary alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](5,"app-alert",4),o["\u0275\u0275text"](6,"A simple secondary alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](7,"app-alert",5),o["\u0275\u0275text"](8,"A simple success alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](9,"app-alert",6),o["\u0275\u0275text"](10,"A simple danger alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](11,"app-alert",7),o["\u0275\u0275text"](12,"A simple warning alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](13,"app-alert",8),o["\u0275\u0275text"](14,"A simple info alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](15,"app-alert",9),o["\u0275\u0275text"](16,"A simple light alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](17,"app-alert",10),o["\u0275\u0275text"](18,"A simple dark alert\u2014check it out!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](19,"div",11),o["\u0275\u0275elementStart"](20,"app-card",12),o["\u0275\u0275elementStart"](21,"app-alert",3),o["\u0275\u0275text"](22,"A simple primary with "),o["\u0275\u0275elementStart"](23,"a",13),o["\u0275\u0275text"](24,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](25,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](26,"app-alert",4),o["\u0275\u0275text"](27,"A simple secondary with "),o["\u0275\u0275elementStart"](28,"a",13),o["\u0275\u0275text"](29,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](30,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](31,"app-alert",5),o["\u0275\u0275text"](32,"A simple success with "),o["\u0275\u0275elementStart"](33,"a",13),o["\u0275\u0275text"](34,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](35,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](36,"app-alert",6),o["\u0275\u0275text"](37,"A simple danger with "),o["\u0275\u0275elementStart"](38,"a",13),o["\u0275\u0275text"](39,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](40,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](41,"app-alert",7),o["\u0275\u0275text"](42,"A simple warning with "),o["\u0275\u0275elementStart"](43,"a",13),o["\u0275\u0275text"](44,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](45,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](46,"app-alert",8),o["\u0275\u0275text"](47,"A simple info with "),o["\u0275\u0275elementStart"](48,"a",13),o["\u0275\u0275text"](49,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](50,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](51,"app-alert",9),o["\u0275\u0275text"](52,"A simple light with "),o["\u0275\u0275elementStart"](53,"a",13),o["\u0275\u0275text"](54,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](55,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](56,"app-alert",10),o["\u0275\u0275text"](57,"A simple dark with "),o["\u0275\u0275elementStart"](58,"a",13),o["\u0275\u0275text"](59,"an example link"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275text"](60,". Give it a click if you like."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](61,"div",11),o["\u0275\u0275elementStart"](62,"app-card",14),o["\u0275\u0275elementStart"](63,"app-alert",15),o["\u0275\u0275text"](64,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](65,"app-alert",16),o["\u0275\u0275text"](66,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](67,"app-alert",17),o["\u0275\u0275text"](68,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](69,"app-alert",18),o["\u0275\u0275text"](70,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](71,"app-alert",19),o["\u0275\u0275text"](72,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](73,"app-alert",20),o["\u0275\u0275text"](74,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](75,"app-alert",21),o["\u0275\u0275text"](76,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](77,"app-alert",22),o["\u0275\u0275text"](78,"Holy guacamole! You should check in on some of those fields below."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](79,"div",1),o["\u0275\u0275elementStart"](80,"app-card",23),o["\u0275\u0275elementStart"](81,"app-alert",5),o["\u0275\u0275elementStart"](82,"h4",24),o["\u0275\u0275text"](83,"Well done!"),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementStart"](84,"p"),o["\u0275\u0275text"](85,"Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275element"](86,"hr"),o["\u0275\u0275elementStart"](87,"p",25),o["\u0275\u0275text"](88,"Whenever you need to, be sure to use margin utilities to keep things nice and tidy."),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"](),o["\u0275\u0275elementEnd"]()),2&e&&(o["\u0275\u0275advance"](2),o["\u0275\u0275property"]("options",!1),o["\u0275\u0275advance"](18),o["\u0275\u0275property"]("options",!1),o["\u0275\u0275advance"](42),o["\u0275\u0275property"]("options",!1),o["\u0275\u0275advance"](18),o["\u0275\u0275property"]("options",!1))},directives:[m.a,s.a],styles:[""]}),l)}],c=((a=_createClass((function e(){_classCallCheck(this,e)}))).\u0275mod=o["\u0275\u0275defineNgModule"]({type:a}),a.\u0275inj=o["\u0275\u0275defineInjector"]({factory:function(e){return new(e||a)},imports:[[r.j.forChild(p)],r.j]}),a),d=n("ebz3");n.d(t,"BasicAlertModule",(function(){return h}));var u,h=((u=_createClass((function e(){_classCallCheck(this,e)}))).\u0275mod=o["\u0275\u0275defineNgModule"]({type:u}),u.\u0275inj=o["\u0275\u0275defineInjector"]({factory:function(e){return new(e||u)},imports:[[i.CommonModule,c,d.a]]}),u)}}]);