
import { _decorator, Component, Node, Label } from 'cc';
import { RedDotManager } from '../../../logic/RedDotManager';
const { ccclass, property } = _decorator;

@ccclass('MainWindow')
export class MainWindow extends Component {

    @property(Node)
    mailWindow: Node;
    
    @property(Node)
    mailRedDot: Node;
    
    @property(Label)
    mailRedDotLabel: Label;
    
    @property(Node)
    bulletsWindow: Node;
    
    @property(Node)
    bullestRedDot: Node;

    onLoad() {
        // 可以认为这里是全局初始化的地方
        RedDotManager.init();
        
        // 添加红点结点
        RedDotManager.redDotTree.addNode("MailButton");
        RedDotManager.redDotTree.addNode("BulletsButton", false);
        RedDotManager.redDotTree.addNode("BulletsButton/Bullet1", true);
        RedDotManager.redDotTree.addNode("BulletsButton/Bullet2", true);
        RedDotManager.redDotTree.addNode("BulletsButton/Bullet3", true);

        // 初始化红点数值
        RedDotManager.redDotTree.changeRedDotNum("BulletsButton/Bullet1", 1);
        RedDotManager.redDotTree.changeRedDotNum("BulletsButton/Bullet2", 1);
        RedDotManager.redDotTree.changeRedDotNum("BulletsButton/Bullet3", 1);
    }

    start () {
        this.mailWindow.active = false;
        this.bulletsWindow.active = false;
        RedDotManager.redDotTree.registerCallback("MailButton", this.onMailRedDotChanged.bind(this));
        RedDotManager.redDotTree.registerCallback("BulletsButton", this.onBulletsRedDotChanged.bind(this));
    }
   
    protected onMailButtonClicked (event: Event, customEventData: string) {
        this.mailWindow.active = !this.mailWindow.active;
    }

    private onMailRedDotChanged(redNum: number) {
        // 红点大于0就可见
        this.mailRedDot.active = redNum > 0;
        // 红点节点上的红点值更新
        this.mailRedDotLabel.string = redNum.toString();
    }
    
    protected onBullestButtonClicked (event: Event, customEventData: string) {
        this.bulletsWindow.active = !this.bulletsWindow.active;
    }

    private onBulletsRedDotChanged(redNum: number) {
        this.bullestRedDot.active = redNum > 0;
    }
}
