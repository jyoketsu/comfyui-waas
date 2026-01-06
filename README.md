# ComfyUI WaaS Plugin

A ComfyUI custom node plugin that provides web-based model management, cloud model library access, and a modern Vue.js frontend interface.

## 📋 Project Overview

ComfyUI WaaS is a ComfyUI plugin that integrates seamlessly into the ComfyUI interface, offering:

- **Model Management**: Sync, clear, and refresh AI models directly from ComfyUI
- **Cloud Model Library**: Access to a large collection of commonly used models
- **Cloud Sharing**: Share private models through cloud storage without requiring downloads
- **Floating Button Interface**: Easy-to-use draggable button for quick access to features
- **Vue.js Admin Panel**: Modern web interface for model management
- **API Proxy**: Secure proxy service for forwarding API requests

## 🏗️ Project Structure

```
comfyui-waas/
├── __init__.py           # ComfyUI plugin entry point
├── routes/               # Python backend API routes
│   ├── models.py        # Model management endpoints
│   ├── proxy.py         # API proxy service
│   └── update.py        # Update-related endpoints
├── web/                  # ComfyUI web extension
│   ├── nodes/           # Custom ComfyUI nodes
│   ├── waas.css         # Plugin styles
│   └── waas.js          # Frontend extension logic
├── vue/                  # Vue.js admin panel
│   ├── src/
│   │   ├── api/        # API client modules
│   │   ├── components/ # Vue components
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utility functions
│   │   └── styles/     # CSS styles
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
├── copy2server.sh      # Deployment script
├── refresh_models.sh   # Model refresh script
└── README.md           # This file
```

## 🚀 Features

### Plugin Features
- **Cloud Model Library (云扉公模库)**
  - Access to a large collection of commonly used AI models
  - Selective synchronization of models to your local environment
  - Easy-to-use web interface for model selection

- **Cloud Sharing (云扉共享盘)**
  - Share private models through cloud storage
  - Recipients can access models without downloading
  - Integrated with CloudOS for seamless sharing

- **Model Management**
  - Sync models from source to destination paths
  - Clear invalid or unused models
  - Refresh models to update ComfyUI's model list
  - Detect and manage ineffective symlinks
  - Environment variable access

- **Floating Button Interface**
  - Draggable floating button in ComfyUI
  - Quick access to all plugin features
  - Persistent position memory
  - Sidebar/centered view toggle

- **Vue.js Admin Panel**
  - Modern web interface for model management
  - Responsive design
  - Dark/Light theme support
  - Image cropping and upload capabilities

- **API Proxy**
  - Forward requests to external APIs
  - Header filtering and normalization
  - SSL configuration support
  - Timeout handling

## 🛠️ Installation

### Prerequisites

- ComfyUI installed and running
- Node.js 16+ (for building the Vue admin panel)
- pnpm or npm (for building the Vue admin panel)

### Plugin Installation

1. Clone or download this repository

2. Copy the plugin to ComfyUI's custom_nodes directory:
```bash
# Assuming ComfyUI is installed in ~/comfyui/ComfyUI
cp -r comfyui-waas ~/comfyui/ComfyUI/custom_nodes/
```

3. Restart ComfyUI to load the plugin

4. The plugin will automatically register and display a floating button in the ComfyUI interface

### Building the Vue Admin Panel (Optional)

If you want to modify or rebuild the Vue admin panel:

1. Navigate to the Vue directory:
```bash
cd ~/comfyui/ComfyUI/custom_nodes/comfyui-waas/vue
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Build the admin panel:
```bash
pnpm build
# or
npm run build
```

4. The built files will be placed in `web/dist/` and served by ComfyUI

## 📖 Usage

### Basic Usage

1. **Access the Plugin**
   - After installing, you'll see a floating button in the ComfyUI interface
   - Click the button to open the dropdown menu

2. **Cloud Model Library (云扉公模库)**
   - Click "云扉公模库" to open the model library
   - Browse and select models you want to sync
   - Models will be linked to your local ComfyUI models directory

3. **Cloud Sharing (云扉共享盘)**
   - Click "云扉共享盘" to access shared models
   - Requires WAAS_ID environment variable to be configured
   - Opens CloudOS interface for model sharing

4. **Refresh Models**
   - Click "刷新models" after manually adding/removing models
   - This updates ComfyUI's model list
   - Useful when models aren't showing up in ComfyUI

5. **Update Plugin**
   - Click "更新插件" to check for and install updates
   - Automatically downloads and installs the latest version

### Advanced Features

#### Model Synchronization
- Use the web interface to selectively sync models
- Models are linked using symlinks to save disk space
- Invalid symlinks are automatically detected

#### Environment Variables
The plugin can access and use the following environment variables:
- `WAAS_ID`: Your WaaS instance ID
- `CUDA_VERSION`: CUDA version information

#### Custom Model Refresh Script
The plugin uses `/etc/waas-script/refresh_models.sh` by default for model refresh. You can customize this script to fit your needs.

### Development

#### Frontend Development
```bash
cd vue
pnpm dev
# or
npm run dev
```

#### Build for Production
```bash
cd vue
pnpm build
# or
npm run build
```

#### Deploy to Server
```bash
./copy2server.sh
```

### Model Management Scripts

#### Refresh Models
```bash
./refresh_models.sh
```

This script refreshes the ComfyUI model list after adding or removing models.

## 🔌 API Endpoints

All API endpoints are automatically registered under `/browser/` prefix when the plugin loads.

### Model Management

#### Get Ineffective Models
```http
POST /browser/models/ineffective
Content-Type: application/json

{
  "rootPaths": ["/path/to/models"]
}
```

#### Clear Models
```http
POST /browser/models/clear
Content-Type: application/json

{
  "paths": ["/path/to/model1", "/path/to/model2"]
}
```

#### Sync Models
```http
POST /browser/models/sync
Content-Type: application/json

{
  "rootPath": "/source/path",
  "models": ["model1", "model2"],
  "dstPath": "/destination/path"
}
```

#### Refresh Models
```http
POST /browser/models/refresh
Content-Type: application/json

{
  "shellPath": "/path/to/script.sh",
  "args": ["arg1", "arg2"]
}
```

#### Get Environment Variables
```http
POST /browser/models/envs
Content-Type: application/json

{
  "envs": ["VAR1", "VAR2"]
}
```

### Update Management

#### Check for Updates
```http
POST /browser/update/check-update
```

#### Update Plugin
```http
POST /browser/update/update
```

### API Proxy

All proxy requests are forwarded to the configured backend URL:
```http
GET|POST|PUT|DELETE /browser/proxy/{tail}
```

## 🔧 Configuration

### Frontend Configuration (vue/.env)

```env
VITE_API_BASE_URL=/browser
VITE_APP_TITLE=ComfyUI WaaS
```

### Backend Configuration

Edit [`routes/proxy.py`](routes/proxy.py:5) to configure the proxy base URL:
```python
BASE_URL = "https://waas.aigate.cc/api"
```

### Environment Variables

The plugin uses the following environment variables:
- `WAAS_ID`: Your WaaS instance ID (required for cloud sharing)
- `CUDA_VERSION`: CUDA version information

## 📦 Dependencies

### Plugin Dependencies
- ComfyUI (the plugin integrates with ComfyUI's extension system)
- aiohttp (Python HTTP server, typically already included with ComfyUI)

### Vue Admin Panel Dependencies
- Vue 3.2+
- Element Plus 2.9+
- TypeScript 5.4+
- Vite 5.2+
- Tailwind CSS 3.4+
- Axios 1.5+
- Pinia 2.1+
- Vue Router 4.4+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with ComfyUI
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions, please:
1. Check the [documentation](https://docs.aigate.cc/bestPractice/aigatePlugin.html)
2. Open an issue on the repository
3. Contact the development team

## 🎯 Roadmap

- [ ] Add user authentication and authorization
- [ ] Implement real-time model status updates
- [ ] Add comprehensive logging and monitoring
- [ ] Create automated tests
- [ ] Add more model management features
- [ ] Improve UI/UX based on user feedback

## 🙏 Acknowledgments

- ComfyUI community for the amazing node-based UI
- Vue.js team for the excellent frontend framework
- Element Plus team for the beautiful UI components
- All contributors and users of this plugin

## 📚 Additional Resources

- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [CloudGate Documentation](https://docs.aigate.cc/bestPractice/aigatePlugin.html)
- [Plugin Usage Guide](https://docs.aigate.cc/bestPractice/aigatePlugin.html)
