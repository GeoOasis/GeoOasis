## 应用程序页面设计

Cesium也自带了组件，可以封装一下

### 需要的组件

## 协同部分 核心层结构

### 组织结构

如果按照图层来组织数据：类似于figma、notion、quill，整个文档是一个树结构：LayerCollection

而数据分为三种部分（还需要参考Cesium和deckgl的组织）

1. 不可变数据（basemap，3dtiles，3dmodel）BackgroundLayer
2. 中间数据 geojson，bimmodel，vector，raster
3. 可变数据 EditorLayer (geojson, marker, img, line, poly)

### 协同内容

LayerCollection的图层顺序，以及内容

可变数据需要协同

用户的点击事件也需要传递，位置需要传递（类似cursor 位置）
