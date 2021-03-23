// 이거만 사용할거라 믿고 써본다
const kDeviceId = '1000d757b1';
const kMaxChannel = 4;

const sleep = (ms) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const readline = require('readline');
const Ewelink = require('ewelink-api');
const Zeroconf = require('ewelink-api/src/classes/Zeroconf');

// 인풋을 받기위한 작업 되도록이면 건드리지 말도록
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.setPrompt('> ');

let device = null;
const printConsoleMenu = async (connection) => {
    device = await connection.getDevice(kDeviceId);
    
    console.clear();
    console.info('사용중 기기 ID:', device.deviceid);
    console.info('기기 이름:', device.name);
    console.info();

    console.info(`1) 채널 1 토글 (현재 상태: ${device.params.switches[0].switch})`);
    console.info(`2) 채널 2 토글 (현재 상태: ${device.params.switches[1].switch})`);
    console.info(`3) 채널 3 토글 (현재 상태: ${device.params.switches[2].switch})`);
    console.info(`4) 채널 4 토글 (현재 상태: ${device.params.switches[3].switch})`);
    console.info();

    console.info('5) 오디오 켜기')
    console.info('6) 오디오 끄기')
    console.info('0) 종료')
    console.info();
}

let pressEnter = false;

// 비동기 코드를 사용하는데 async 함수에 안넣어주면 에러 발생하니까 async 함수를 생성하고 바로 실행하는 코드
(async () => {
    const devicesCache = await Zeroconf.loadCachedDevices();
    const arpTable = await Zeroconf.loadArpTable();
    const connection = new Ewelink({ devicesCache, arpTable });
    // const connection = new Ewelink({
    //     email: 'clove7802@gmail.com',
    //     password: 'aass4123',
    //     region: 'cn',
    // });
    // await connection.saveDevicesCache();
    // await Zeroconf.saveArpTable({ ip: '192.168.1.176' });

    await printConsoleMenu(connection);
    rl.prompt();

    rl.on('line', async (line) => {
        const channel = +line;
        
        if (pressEnter == false) {
            if (Number.isInteger(channel) && channel >= 0) {
                if (channel == null) { //입력값 없을때
                    await printConsoleMenu(connection);
                    rl.prompt();//메뉴 재출력
                } else if (channel == 0) {
                    process.exit(0);
                } else if (channel <= kMaxChannel) { //채널 선택시
                    const toggle = device.params.switches[channel - 1].switch === 'on' ? 'off' : 'on'; //채널 on off 확인
                    await connection.setDevicePowerState(kDeviceId, toggle, channel); //조작
                    await printConsoleMenu(connection);
                    rl.prompt();
                } else if (channel == 5) {
                    await connection.setDevicePowerState(kDeviceId, 'on', '4');
                    await connection.setDevicePowerState(kDeviceId, 'on', '3');
                    await sleep(1500); //1.5ms 대기
                    await connection.setDevicePowerState(kDeviceId, 'on', '2');
                    await printConsoleMenu(connection);
                    rl.prompt();
                } else if (channel == 6) {
                    await connection.setDevicePowerState(kDeviceId, 'off', '2');
                    await sleep(1000); //1ms 대기
                    await connection.setDevicePowerState(kDeviceId, 'off', '3');
                    await connection.setDevicePowerState(kDeviceId, 'off', '4');
                    await printConsoleMenu(connection);
                    rl.prompt();
                } else {
                    pressEnter = true;
                    console.info('없는 옵션! Enter키를 눌러주세요');
                }
            } else { //그외의 값 입력시
                await printConsoleMenu(connection);
                rl.prompt(); //메뉴 재출력
            }
        } else {
            pressEnter = false;
            await printConsoleMenu(connection);
            rl.prompt();
        }
    });
})();