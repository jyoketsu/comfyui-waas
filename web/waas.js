import { app } from "../../scripts/app.js";
import { $el, ComfyDialog } from "../../scripts/ui.js";
import { api } from "../../scripts/api.js";

const browserUrl = "./browser/web/index.html";

const localStorageKey = 'comfyui-browser';

function getLocalConfig() {
  let localConfig = localStorage.getItem(localStorageKey);
  if (localConfig) {
    localConfig = JSON.parse(localConfig);
  } else {
    localConfig = {};
  }

  return localConfig;
}

function setLocalConfig(key, value) {
  let localConfig = getLocalConfig();
  localConfig[key] = value;
  localStorage.setItem(localStorageKey, JSON.stringify(localConfig));
}

class BrowserDialog extends ComfyDialog {
  constructor() {
    super();

    const localConfig = getLocalConfig();
    let modalStyle = {
      width: "70%",
      height: "80%",
      maxWidth: "100%",
      maxHeight: "100%",
      minWidth: "24%",
      minHeight: "24%",
      padding: "6px",
      zIndex: 1000,
      resize: 'auto',
    };
    const cs = localConfig.modalStyles;
    if (cs) {
      modalStyle.left = cs.left;
      modalStyle.top = cs.top;
      modalStyle.transform = cs.transform;
      modalStyle.height = cs.height;
      modalStyle.width = cs.width;
    }

    this.element = $el("div.comfy-modal", {
      id: "comfy-browser-dialog",
      parent: document.body,
      style: modalStyle,
    }, [
      $el("div.comfy-modal-content", {
        style: {
          width: "100%",
          height: "100%",
        },
      }, [
        $el("iframe", {
          src: browserUrl + "?timestamp=" + Date.now(),
          style: {
            width: "100%",
            height: "100%",
          },
        }),
        ...this.createButtons(),
      ]),
    ]);

    new ResizeObserver(
      this.onResize.bind(this)
    ).observe(this.element);
  }

  createButtons() {
    const closeBtn = $el("button", {
      type: "button",
      textContent: "关闭",
      onclick: () => this.close(),
    });
    const browseBtn = $el("a", {
      href: browserUrl,
      target: "_blank",
    }, [
      $el("button", {
        type: "button",
        textContent: "在新标签页中打开",
      }),
    ]);
    const toggleSidePanelBtn = $el("button", {
      type: "button",
      textContent: "侧边/居中",
      onclick: () => this.toggleSidePanel(),
    });
    return [
      $el("div", {
        style: {
          marginTop: '10px'
        }
      }, [
        closeBtn,
        browseBtn,
        toggleSidePanelBtn,
      ]),
    ];
  }

  onResize() {
    const e = this.element;
    setLocalConfig('modalStyles', {
      left: e.style.left,
      top: e.style.top,
      transform: e.style.transform,
      height: e.style.height,
      width: e.style.width,
    });
  }

  toggleSidePanel() {
    const e = this.element;
    if (e.style.left === '0px') {
      e.style.left = '';
      e.style.top = '';
      e.style.transform = '';
      e.style.height = '85%';
      e.style.width = '80%';
    } else {
      e.style.left = '0px';
      e.style.top = '0px';
      e.style.transform = 'translate(-10px, -10px)';
      e.style.height = '100%';
      e.style.width = '32%';
    }

    setLocalConfig('modalStyles', {
      left: e.style.left,
      top: e.style.top,
      transform: e.style.transform,
      height: e.style.height,
      width: e.style.width,
    });
  }

  close() {
    this.element.style.display = "none";
  }

  show() {
    this.element.style.display = "flex";
    dispatchEvent(new Event('comfyuiBrowserShow'));
  }

  toggle() {
    const e = this.element;
    if (e.style.display === "none") {
      this.show();
    } else {
      this.close();
    }
  }
}

function showToast(text, onClick) {
  const toastId = 'comfy-browser-toast';
  let toast = document.getElementById(toastId);
  if (!toast) {
    toast = $el("p", {
      id: toastId,
      textContent: '',
      onclick: onClick,
      style: {
        position: 'fixed',
        top: '70%',
        left: '34%',
        zIndex: 999,
        backgroundColor: 'var(--comfy-menu-bg)',
        fontSize: '42px',
        color: 'green',
        padding: '8px',
        border: 'green',
        borderStyle: 'solid',
        borderRadius: '0.5rem',
        display: 'none',
      }
    });
    document.body.appendChild(toast);
  }

  toast.textContent = text;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 1000);
}

app.registerExtension({
  name: "comfyui.waas",
  init() {
  },
  async setup() {
    console.log("[waas] ------------------------------------------------");
    // 自动加载 CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/extensions/comfyui-waas/waas.css";
    document.head.appendChild(link);

    const browserDialog = new BrowserDialog();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'b') {
        if (event.target.matches('input, textarea')) {
          return;
        }

        browserDialog.toggle();
        event.preventDefault();
      }
    });
    //  add event listener for ctrl+i
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'i') {
        browserDialog.toggle();
        event.preventDefault();
      }
    })
    app.ui.menuContainer.appendChild(
      $el("div.comfy-list", {
        style: {
          width: "100%",
          "border-style": "none",
          "margin-bottom": "none",
        }
      }, [
        $el("button", {
          id: "comfyui-browser-button",
          textContent: "Browser",
          title: "Browse and manage your outputs and collections",
          style: {
            "font-size": "20px",
            color: "red !important",
            //color: "var(--descrip-text) !important",
            width: "80%",
          },
          onclick: () => { browserDialog.show() },
        }),
        $el("button", {
          id: "comfyui-browser-collect-button",
          textContent: "💾",
          title: "Save workflow to collections",
          style: {
            width: "20%",
            "font-size": "17px",
          },
          onclick: (e) => {
            const saveBtn = e.target;
            const originBtnStyle = saveBtn.style.cssText;

            let filename = "workflow.json";
            const promptFilename = app.ui.settings.getSettingValue(
              "Comfy.PromptFilename",
              true,
            );
            if (promptFilename) {
              filename = prompt("Collect workflow as:", filename);
              if (!filename) return;
              if (!filename.toLowerCase().endsWith(".json")) {
                filename += ".json";
              }
            }
            app.graphToPrompt().then(async p => {
              const json = JSON.stringify(p.workflow, null, 2); // convert the data to a JSON string
              const res = await api.fetchApi("/browser/collections/workflows", {
                method: "POST",
                body: JSON.stringify({
                  filename: filename,
                  content: json,
                }),
              });
              if (res.ok) {
                saveBtn.style = originBtnStyle + "border-color: green;";
                showToast(
                  'Saved. Click me to open.',
                  () => { browserDialog.show() },
                );
              } else {
                saveBtn.style = originBtnStyle + "border-color: red;";
              }
              setTimeout(() => {
                saveBtn.style = originBtnStyle;
              }, 1000);
            });
          },
        }),
      ])
    );


    // ============================
    // Draggable Floating Button
    // ============================
    var isDragging = false;

    function showDropdown() {
      document.getElementById("comfyui-waas-dropdown").style.height = '90px';
      document.getElementById("comfyui-waas-dropdown").style.paddingTop = '4px'
      document.getElementById("comfyui-waas-dropdown").style.paddingBottom = '20px'
    }

    function hideDropdown() {
      document.getElementById("comfyui-waas-dropdown").style.height = 0;
      document.getElementById("comfyui-waas-dropdown").style.paddingTop = 0
      document.getElementById("comfyui-waas-dropdown").style.paddingBottom = 0
    }

    function toggleDropdown() {
      if (document.getElementById("comfyui-waas-dropdown").style.height === '90px') {
        hideDropdown()
      } else {
        showDropdown()
      }
    }

    // 点击页面其他地方隐藏下拉菜单
    function handleDocumentClick(event) {
      const dropdown = document.getElementById("comfyui-waas-dropdown");
      const button = document.getElementById("comfyui-waas-btn");

      // 检查点击是否在按钮或下拉菜单内部
      const isClickInside = button.contains(event.target) ||
        (dropdown && dropdown.contains(event.target));

      // 如果点击在外部且下拉菜单是展开状态，则隐藏
      if (!isClickInside && dropdown && dropdown.style.height === '90px') {
        hideDropdown();
      }
    }

    document.addEventListener('click', handleDocumentClick);

    const floatBtn = $el("div", {
      id: "comfyui-waas-btn",
    }, [
      $el("div", {
        id: "comfyui-waas-logo",
        onclick: () => {
          // 👉 加判断：拖拽时不触发点击
          if (isDragging) {
            return;
          }
          toggleDropdown();
        }
      }),
      $el("div", {
        id: "comfyui-waas-dropdown",
      }, [
        $el("button", {
          className: "comfyui-waas-dropdown-btn",
          textContent: "云扉公模库",
          onclick: () => {
            browserDialog.show()
            hideDropdown()
          }
        }),
        $el("button", {
          className: "comfyui-waas-dropdown-btn",
          textContent: "云扉共享盘",
          onclick: () => {
            window.open("https://your-cloud-share-link.com", "_blank");
            hideDropdown()
          }
        }),
        $el("button", {
          className: "comfyui-waas-dropdown-btn",
          textContent: "刷新models",
          onclick: async () => {
            try {
              const res = await api.fetchApi("/browser/models/refresh", {
                method: "POST"
              });
              if (res.ok) {
                showToast("Models刷新成功", () => { });
              } else {
                showToast("刷新失败，请重试", () => { });
              }
            } catch (error) {
              showToast("刷新失败: " + error.message, () => { });
            } finally {
              hideDropdown()
            }
          }
        })
      ])
    ]);

    document.body.appendChild(floatBtn);

    // Drag logic
    (function enableDrag() {
      let dragging = false;
      let offsetX = 0;
      let offsetY = 0;

      floatBtn.addEventListener("mousedown", (e) => {
        dragging = true;
        offsetX = e.clientX - floatBtn.offsetLeft;
        offsetY = e.clientY - floatBtn.offsetTop;
        floatBtn.style.transition = "none";
      });

      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        floatBtn.style.left = e.clientX - offsetX + "px";
        floatBtn.style.top = e.clientY - offsetY + "px";
        floatBtn.style.bottom = "auto";
        floatBtn.style.right = "auto";
        isDragging = true;
      });

      document.addEventListener("mouseup", () => {
        dragging = false;
        floatBtn.style.transition = "all 0.15s ease-out";
        setTimeout(() => {
          isDragging = false;
        }, 2000);
      });
    })();


    try {
      // new menu based features
      // browser and save to collection button into new style menu
      let cbGroup = new (await import("../../scripts/ui/components/buttonGroup.js")).ComfyButtonGroup(
        new (await import("../../scripts/ui/components/button.js")).ComfyButton({
          action: () => {
            if (browserDialog)
              browserDialog.show();
          },
          tooltip: "Browse and manage your outputs and collections",
          content: "📚",
          // content: "🪟",
          // content: "Browser",
          // icon: "table",// cloud, folder, folder-open, table, database, server
          // classList: "comfyui-button comfyui-menu-mobile-collapse primary"
          classList: "comfyui-button comfyui-menu-mobile-collapse "
        }).element,
        new (await import("../../scripts/ui/components/button.js")).ComfyButton({
          action: (e) => {
            const saveBtn = e.target;
            const originBtnStyle = saveBtn.style.cssText;

            let filename = "workflow.json";
            const promptFilename = app.ui.settings.getSettingValue(
              "Comfy.PromptFilename",
              true,
            );
            if (promptFilename) {
              filename = prompt("Collect workflow as:", filename);
              if (!filename) return;
              if (!filename.toLowerCase().endsWith(".json")) {
                filename += ".json";
              }
            }
            app.graphToPrompt().then(async p => {
              const json = JSON.stringify(p.workflow, null, 2); // convert the data to a JSON string
              const res = await api.fetchApi("/browser/collections/workflows", {
                method: "POST",
                body: JSON.stringify({
                  filename: filename,
                  content: json,
                }),
              });
              if (res.ok) {
                saveBtn.style = originBtnStyle + "border-color: green;";
                showToast(
                  'Saved. Click me to open.',
                  () => { browserDialog.show() },
                );
              } else {
                saveBtn.style = originBtnStyle + "border-color: red;";
              }
              setTimeout(() => {
                saveBtn.style = originBtnStyle;
              }, 1000);
            });
          },
          tooltip: "Save workflow to collections",
          content: "💾",
          classList: "comfyui-button comfyui-menu-mobile-collapse "
        }).element
      );
      app.menu?.settingsGroup.element.before(cbGroup.element);

    } catch (exception) {
      console.log('ComfyUI-Browser could not load new menu based features.');
    }
  },
});
