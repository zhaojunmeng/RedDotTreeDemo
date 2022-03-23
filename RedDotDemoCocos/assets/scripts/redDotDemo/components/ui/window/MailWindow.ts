
import { _decorator, Component, Label, Node, Prefab, instantiate, RichText } from 'cc';
import { ListItemMail } from '../../ListItemMail';
const { ccclass, property } = _decorator;

@ccclass('MailItem')
export class MailItem {
   @property
   title: string = '';
   @property
   content: string = '';
}
 
@ccclass('MailWindow')
export class MailWindow extends Component {

    @property(RichText)
    mailContent: RichText = null;

    @property(Node)
    mailList: Node = null;
    @property([MailItem])
    items: MailItem[] = [];
    
    @property(Prefab)
    itemPrefab: Prefab = null!;

    private itemIndex: number = 0;
 
    onLoad() {
        for (var i = 0; i < this.items.length; ++i) {
            var item = instantiate(this.itemPrefab);
            var data = this.items[i];
            this.mailList.addChild(item);
            (item.getComponent('ListItemMail') as ListItemMail)!.init(i, data, this);
        }

        // this.setCurrentItem(0);
    }

    start () {
        // [3]
    }

    public setCurrentItem(index: number) {
        this.itemIndex = index;
        this.mailContent.string = this.items[index].content;
    }

    protected onBackButtonClicked (event: Event, customEventData: string) {
        console.log(customEventData); // foobar
        this.node.active = false;
    }

    protected onReadButtonClicked (event: Event, customEventData: string) {
        // change the reddot state
    }
}
