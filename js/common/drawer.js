document.addEventListener('DOMContentLoaded', function () {
  const drawerBtn = document.getElementById('menu_btn');
  if (!drawerBtn) return;

  const drawer = document.createElement('div');
  drawer.className = 'mdui-drawer mdui-drawer-right mdui-container-fluid';
  drawer.innerHTML = `
<div class="mdui-panel" mdui-panel>
  <div class="mdui-panel-item mdui-panel-item-open">
    <div class="mdui-panel-item-header mdui-ripple">
      <div>网站导航</div>
      <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
    </div>
    <div class="mdui-panel-item-body">
      <a class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple" href="/html/list.html"><i class="mdui-icon material-icons">list</i> 资源列表</a>
      <a class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple" href="/html/sponsor.html"><i class="mdui-icon material-icons">card_giftcard</i> 赞助站长</a>
      <a class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple" href="/html/about.html"><i class="mdui-icon material-icons">people</i> 关于网站</a>
    </div>
  </div>
  <div class="mdui-panel-item mdui-panel-item-open">
    <div class="mdui-panel-item-header mdui-ripple">
      <div>网站设置</div>
      <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
    </div>
    <div class="mdui-panel-item-body">
      <a class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple" href="/html/theme.html"><i class="mdui-icon material-icons">style</i> 主题设置</a>
    </div>
  </div>
</div>
`;
  document.body.appendChild(drawer);

  document.body.classList.add('mdui-drawer-body-right');

  mdui.mutation();

  const drawerInstance = new mdui.Drawer(drawer);
  drawerBtn.addEventListener('click', function () {
    drawerInstance.toggle();
  });
});