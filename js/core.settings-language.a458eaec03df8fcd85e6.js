(window.webpackJsonp=window.webpackJsonp||[]).push([["settings-language"],{736:function(e,a,n){"use strict";n.r(a);var t=n(0),g=n(10),l=n.n(g),s=n(7),c=n.n(s),i=n(6),r=n(2),u=n(78),o=function(e){return e===u.b},_=function(e){var a=e.children,n=e.lang;return t.createElement("div",{id:"dt_settings_".concat(n,"_button"),className:l()("settings-language__language-link",{"settings-language__language-link--active":o(n)})},a)},m=function(e){var a=e.lang;return t.createElement(t.Fragment,null,t.createElement(i.Icon,{icon:"IcFlag".concat(a.replace("_","-")),className:"settings-language__language-link-flag settings-language__language-flag",type:a.replace(/(\s|_)/,"-").toLowerCase()}),t.createElement("span",{className:l()("settings-language__language-name",{"settings-language__language-name--active":o(a)})},Object(u.c)()[a]))};m.propTypes={lang:c.a.string},_.propTypes={children:c.a.oneOfType([c.a.arrayOf(c.a.node),c.a.node]).isRequired,lang:c.a.string},a.default=function(){return t.createElement("div",{className:"settings-language"},t.createElement("div",{className:"settings-language__language-header"},t.createElement(i.Text,{size:"xs",color:"prominent",weight:"bold"},t.createElement(r.Localize,{i18n_default_text:"Select language"}))),t.createElement("div",{className:"settings-language__language-container"},Object.keys(Object(u.c)()).map((function(e){return o(e)?t.createElement(_,{lang:e,key:e},t.createElement(m,{lang:e})):t.createElement("span",{id:"dt_settings_".concat(e,"_button"),key:e,onClick:function(){return Object(u.a)(e)},className:l()("settings-language__language-link",{"settings-language__language-link--active":o(e)})},t.createElement(m,{lang:e,key:e}))}))))}}}]);
//# sourceMappingURL=core.settings-language.a458eaec03df8fcd85e6.js.map