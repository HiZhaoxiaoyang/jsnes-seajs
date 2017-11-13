/**
 * creat by zhaoxiaoyang@2017/01/06
 */

;define(function(require, exports, module) {

	var main,
		nes
		,JSNES = require('source/nes')
		,ui = require('source/ui')

	main = {
		init: function() {
			// $(function() {
			nes = new JSNES({
				'ui': $('#emulator').JSNESUI({
					"Homebrew": [
							['魂斗罗Contra', 'roms/Contra/Contra.nes'],
							['Concentration Room', 'roms/croom/croom.nes'],
							['LJ65', 'roms/lj65/lj65.nes']
						]
						// ,"Working": [
						//     ['Bubble Bobble', 'local-roms/Bubble Bobble (U).nes'],

					//     // ['Contra', 'local-roms/Contra (U) [!].nes'],
					//     ['Donkey Kong', 'local-roms/Donkey Kong (JU).nes'],
					//     ['Dr. Mario', 'local-roms/Dr. Mario (JU).nes'],
					//     ['Golf', 'local-roms/Golf (JU).nes'],
					//     ['The Legend of Zelda', 'local-roms/Legend of Zelda, The (U) (PRG1).nes'],
					//     ['Lemmings', 'local-roms/Lemmings (U).nes'],
					//     ['Lifeforce', 'local-roms/Lifeforce (U).nes'],

					//     ['Mario Bros.', 'local-roms/Mario Bros. (JU) [!].nes'],
					//     ['Mega Man', 'local-roms/Mega Man (U).nes'],
					//     ['Pac-Man', 'local-roms/Pac-Man (U) [!].nes'],
					//     ['Super Mario Bros.', 'local-roms/Super Mario Bros. (JU) (PRG0) [!].nes'],
					//     ['Tennis', 'local-roms/Tennis (JU) [!].nes'],
					//     ['Tetris', 'local-roms/Tetris (U) [!].nes'],
					//     ['Tetris 2', 'local-roms/Tetris 2 (U) [!].nes'],
					//     ['Zelda II - The Adventure of Link', 'local-roms/Zelda II - The Adventure of Link (U).nes']
					// ],

					// "Nearly Working": [
					//     ['Duck Hunt', 'local-roms/Duck Hunt (JUE) [!].nes'],
					//     ['Super Mario Bros. 3', 'local-roms/Super Mario Bros. 3 (U) (PRG1) [!].nes']
					// ]
				})
			});

			// debugger;
			// $('select').val("roms/Contra/Contra.nes")
			// });


			console.time("test");
			/*
			    # 按照宽高比例设定html字体, width=device-width initial-scale=1版
			    # @pargam win 窗口window对象
			    # @pargam option{
			      designWidth: 设计稿宽度，必须
			      designHeight: 设计稿高度，不传的话则比例按照宽度来计算，可选
			      designFontSize: 设计稿宽高下用于计算的字体大小，默认20，可选
			      callback: 字体计算之后的回调函数，可选
			    }
			    # return Boolean;
			    # xiaoweili@tencent.com
			    # ps:请尽量第一时间运行此js计算字体
			*/
			! function(win, option) {
				var count = 0,
					designWidth = option.designWidth,
					designHeight = option.designHeight || 0,
					designFontSize = option.designFontSize || 20,
					callback = option.callback || null,
					root = document.documentElement,
					body = document.body,
					rootWidth, newSize, t, self;
				root.style.width = '100%';
				//返回root元素字体计算结果
				function _getNewFontSize() {
					var scale = designHeight !== 0 ? Math.min(win.innerWidth / designWidth, win.innerHeight / designHeight) : win.innerWidth / designWidth;
					return parseInt(scale * 10000 * designFontSize) / 10000;
				}! function() {
					rootWidth = root.getBoundingClientRect().width;
					self = self ? self : arguments.callee;
					//如果此时屏幕宽度不准确，就尝试再次获取分辨率，只尝试20次，否则使用win.innerWidth计算
					if (rootWidth !== win.innerWidth && count < 20) {
						win.setTimeout(function() {
							count++;
							self();
						}, 0);
					} else {
						newSize = _getNewFontSize();
						//如果css已经兼容当前分辨率就不管了
						if (newSize + 'px' !== getComputedStyle(root)['font-size']) {
							root.style.fontSize = newSize + "px";
							return callback && callback(newSize);
						};
					};
				}();
				//横竖屏切换的时候改变fontSize，根据需要选择使用
				win.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
					clearTimeout(t);
					t = setTimeout(function() {
						self();
					}, 300);
				}, false);
			}(window, {
				designWidth: 640,
				designHeight: 1136,
				designFontSize: 20,
				callback: function(argument) {
					console.timeEnd("test")
				}
			});
		}
	}

	return main

});