figma.showUI(__html__, { width: 400, height: 70, themeColors: true });

// Функция для получения локального стиля
async function getLocalStyle(): Promise<PaintStyle[]> {
  try {
    const paintStyles = figma.getLocalPaintStylesAsync();
    return paintStyles;
  } catch (error) {
    figma.closePlugin("Error receiving styles");
    throw new Error("Error receiving styles");
  }
}

// Функция для задания градиентного стиля
async function setGradientStyle(styleName: string): Promise<void> {
  const savedLocalStyle = await getLocalStyle();
  if (!savedLocalStyle) {
    figma.closePlugin("⚠️ Error loading local styles");
    return;
  }
  const myStyle = savedLocalStyle.find((style) => style.name === styleName);
  if (myStyle) {
    if (savedGradientStop && savedGradientTransform) {
      myStyle.paints = [
        {
          type: savedGradientType,
          gradientStops: savedGradientStop,
          gradientTransform: savedGradientTransform,
        },
      ];
    }
    figma.notify(`✅ Style ${styleName} is set`);
  } else {
    figma.notify("⚠️ The style was not found");
  }  
}

// Переменные для хранения данных о градиентном стиле
let savedGradientStop: ColorStop[];
let savedGradientTransform: Transform;
let savedGradientType: GradientPaint;

// Проверка ноды по типу Frame, Rectangle, Vector
const isCorrectNode = (node: SceneNode) => {
  if (node  as (FrameNode | RectangleNode | VectorNode)) {
    return true;
  } else return false;
}

// Проверка на наличие градиентной заливки
const hasGradientFills = (node: SceneNode): boolean => {
  if(isCorrectNode(node)){
    return (node.fills[0].gradientStops !== undefined);
  } return false;
} 

figma.ui.onmessage = msg => {
  if (msg.type ==='submit-input') {
      const selection = figma.currentPage.selection;
      if (selection.length > 0) {
          const firstNode = selection[0];
          if (hasGradientFills(firstNode)) {
            const fills = firstNode.fills;
            //cохраняем данные градиента
            savedGradientStop = fills[0].gradientStops as ColorStop[];
            savedGradientTransform = fills[0].gradientTransform as Transform;
            savedGradientType = fills[0].type;
            // устанавливаем стиль в библиотеку
            setGradientStyle(msg.data);
          } else {
            figma.notify("⚠️ The element has no gradient");
          }
      } else {
        figma.notify("⚠️ Select Frame, Rectangle or Vector");
      }
    }
};
