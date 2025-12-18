import { app } from "../../scripts/app.js";
import { $el, ComfyDialog } from "../../scripts/ui.js";

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
      height: "76%",
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
      e.style.height = '76%';
      e.style.width = '70%';
    } else {
      e.style.left = '0px';
      e.style.top = '100px';
      e.style.transform = 'translate(-10px, -10px)';
      e.style.height = 'calc(100% - 100px)';
      e.style.width = '42%';
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

    // ============================
    // Draggable Floating Button
    // ============================
    var isDragging = false;

    function showDropdown() {
      document.getElementById("comfyui-waas-dropdown").style.height = '142px';
      document.getElementById("comfyui-waas-dropdown").style.paddingTop = '4px'
      document.getElementById("comfyui-waas-dropdown").style.paddingBottom = '20px'
    }

    function hideDropdown() {
      document.getElementById("comfyui-waas-dropdown").style.height = 0;
      document.getElementById("comfyui-waas-dropdown").style.paddingTop = 0
      document.getElementById("comfyui-waas-dropdown").style.paddingBottom = 0
    }

    function toggleDropdown() {
      if (document.getElementById("comfyui-waas-dropdown").style.height === '142px') {
        hideDropdown()
      } else {
        showDropdown()
      }
    }

    const btn1 = $el("button", {
      className: "comfyui-waas-dropdown-btn",
      textContent: "云扉公模库",
      title: "收入大量常用模型，可自主选择同步",
      onclick: () => {
        browserDialog.show()
        hideDropdown()
      }
    });

    const btn2 = $el("button", {
      className: "comfyui-waas-dropdown-btn",
      textContent: "云扉共享盘",
      title: "通过云扉OS使用，可快速分享私有模型，对方无需下载",
      onclick: async (event) => {
        try {
          const res = await fetch(`/browser/models/envs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "envs": [
                "WAAS_ID",
                "CUDA_VERSION"
              ]
            }),
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          const waasId = data.data.WAAS_ID;
          if (!waasId) {
            throw new Error("WAAS_ID not found in response");
          }

          const response = await fetch(`/browser/proxy/openapi/instance/utilsByAgentId?agentId=${waasId}`, {
            method: "GET",
            headers: {
              // todo生产token
              // 测试
              // "Authorization": "Bearer 104a29120af547aabc13fff4ebc3bdfc",
              // 生产
              "Authorization": "Bearer b1e731f0b34f4e5fb0c4a302111c442b",
            },
          });
          if (response.ok) {
            const result = await response.json();
            const apps = result.data;
            const webos = apps.find(app => app.name === 'webos')
            if (webos) {
              window.open(`https://${webos.host}?toLoginUser=root&toLoginPassword=${webos.password}`, "_blank");
            } else {
              showToast("创作者已禁用云扉OS", () => { });
            }
          }
        } catch (error) {
          showToast("获取共享盘失败", () => { });
        } finally {
          hideDropdown()
        }
      }
    });

    const btn3 = $el("button", {
      className: "comfyui-waas-dropdown-btn",
      textContent: "刷新models",
      title: "自主下载/上传模型后，comfyui内找不到模型时，点此按钮",
      onclick: async (event) => {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = "刷新中...";
        try {
          const response = await fetch("/browser/models/refresh", {
            method: "POST",
            body: JSON.stringify({
              shellPath: "/etc/waas-script/refresh_models.sh",
              args: []
            }),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.code === 200) {
              setTimeout(async () => {
                try {
                  await app.refreshComboInNodes();
                  showToast("Models刷新成功", () => { });
                } catch (error) {
                  console.warn("刷新节点选项失败:", error);
                  showToast("Models刷新成功（部分节点可能需要手动刷新）", () => { });
                }
              }, 500);
            } else {
              showToast("刷新失败，请重试", () => { });
            }
          } else {
            showToast("刷新失败，请重试", () => { });
          }
        } catch (error) {
          showToast("刷新失败: " + error.message, () => { });
        } finally {
          btn.disabled = false;
          btn.textContent = "刷新models";
          hideDropdown()
        }
      }
    });

    const docLink = $el("a", {
      href: "https://docs.aigate.cc/bestPractice/aigatePlugin.html",
      target: "_blank",
      textContent: "详情查看文档",
    });

    const tip = $el("div", {
      className: "comfyui-waas-tip",
    }, [
      "初次使用ComfyUI镜像建议同步云扉公模库所有模型，",
      docLink,
      $el("button", {
        textContent: "关闭",
        onclick: (event) => {
          event.stopPropagation();
          // 关闭comfyui-waas-tip
          const tip = document.querySelector('.comfyui-waas-tip');
          if (tip) {
            tip.remove();
          }
        }
      })
    ]);

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
      }, [tip]),
      $el("div", {
        id: "comfyui-waas-dropdown",
      }, [
        btn1,
        btn2,
        btn3,
        $el("button", {
          className: "comfyui-waas-dropdown-btn",
          textContent: "收起",
          onclick: (event) => {
            hideDropdown()
          }
        })
      ])
    ]);

    document.body.appendChild(floatBtn);

    showDropdown();

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
  },
});
