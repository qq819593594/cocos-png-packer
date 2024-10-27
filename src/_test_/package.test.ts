import Packer from "..";

new Packer().packageByPath('D://work//yh-core//images//ChooseUnit_img//image', 'D://work//yh-core//images//ChooseUnit_img//plist', 'ssss').then(
    (ret) => {
        console.log('success');
    }
).catch(
    () => {
        console.error('faild');
    }
);
  