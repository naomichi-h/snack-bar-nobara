const keypress = require('keypress')
const fs = require('fs')
const option = require('minimist')(process.argv.slice(2))
const readlineSync = require('readline-sync')

class Reflexes {
  constructor () {
    this.startMessage = 'マギー「準備はいいかしら？あなたが何かキーを押したら...はじめるわよ...。」'
    this.countdownSecond = 3
    this.randomMilisecondMin = 2000
    this.randomMilisecondMax = 5000

    if (fs.existsSync('./data/result.json')) {
      this.dataJson = require('./data/result.json')
    } else {
      this.dataJson = []
    }
  }

  displayFirstMessage () {
    return new Promise((resolve) => {
      keypress(process.stdin)

      console.log('大阪某所 スナック「のばら」---')

      const str = ['カウンターの美女「あら...あなたここに来るのは初めてかしら...?', 'よく来てくれたわね...歓迎するわ。こちらへどうぞ...。', ' ', '...それにしてもあなた...いい男ね...あら、もしかしたらうつくしい女だったかしら?', 'うふふ、どちらでもいいのよ。あなたのこころの姿だもの。', ' ', 'わたしはマギー。スナック「のばら」のママよ。', ' ', '...ところで、実はここはただのスナックではなくて、ちょっとしたゲームをおこなう場所なのよ。', 'よかったらやってみないかしら？', ' ', '挑戦...してくれるのね？うれしいわ。', ' ', '...挑戦するひとってすてきよね...あのひとみたい...。', ' ', '...。', ' ', 'あら、わたしったらいけないわ。', ' ', 'そうそう、ゲームっていうのはね、反射神経を競うものなの。', ' ', 'ルールは簡単よ。', '私が合図したら...なるべく早くenterキーを押すの...そう、できればやさしくお願いね...。」', ' ']
      let textFlg = 0

      process.stdin.on('keypress', function (ch, key) {
        if (key && textFlg < 24) {
          console.log(str[textFlg])
          textFlg++
        } else if (textFlg === 24) {
          process.stdin.pause()
          fs.writeFile('./data/greeted.txt', '', function (err, result) {
            if (err) console.log('error', err)
          })
          resolve()
        }
      })

      process.stdin.setRawMode(true)
      process.stdin.resume()
    })
  }

  checkStart () {
    return new Promise((resolve) => {
      keypress(process.stdin)
      console.log(this.startMessage)

      process.stdin.on('keypress', function (ch, key) {
        if (key) {
          console.log(' ')
          process.stdin.pause()
          resolve()
        }
      })

      process.stdin.setRawMode(true)
      process.stdin.resume()
    })
  }

  randomMilisecond () {
    const rand = Math.floor(Math.random() * (this.randomMilisecondMax + 1 - this.randomMilisecondMin)) + this.randomMilisecondMin

    return rand
  }

  callPushEnter () {
    return new Promise((resolve) => {
      process.stdin.setRawMode(true)
      process.stdin.resume()

      keypress(process.stdin)
      let stopFlg

      process.stdin.on('keypress', function (ch, key) {
        if (!stopFlg && key.name === 'return') {
          console.log('まだ合図を出していないわ...気持ちはわかるけど、あせってはダメよ。いい女っていうのは、準備に時間がかかるの。')
          process.exit()
        }
      })

      setTimeout(() => {
        console.log(`
今よ！`)
        stopFlg = 1
        process.stdin.pause()
        resolve()
      }, this.randomMilisecond())
    })
  }

  countDown () {
    return new Promise((resolve) => {
      process.stdin.setRawMode(true)
      process.stdin.resume()

      keypress(process.stdin)
      let stopFlg

      process.stdin.on('keypress', function (ch, key) {
        if (!stopFlg && key.name === 'return') {
          console.log('まだ合図を出していないわ...気持ちはわかるけど、あせってはダメよ。いい女っていうのは、準備に時間がかかるの。')
          process.exit()
        }
      })

      const intervalId = setInterval(() => {
        console.log(this.countdownSecond-- + '...')
        if (this.countdownSecond < 1) {
          clearInterval(intervalId)
          stopFlg = 1
          process.stdin.pause()
          resolve()
        }
      }, 1000)
    })
  }

  measureTime () {
    return new Promise((resolve) => {
      keypress(process.stdin)
      const start = Date.now()

      process.stdin.on('keypress', function (ch, key) {
        if (key.name === 'return') {
          const end = Date.now()
          const recordTime = end - start
          process.stdin.pause()
          resolve(recordTime)
        }
      })

      process.stdin.setRawMode(true)
      process.stdin.resume()
    })
  }

  resultAnnouncement (result, rank, topResult) {
    console.log(`
結果は...${result}ms...。
これは今までで${rank}番目に早い記録よ。
これまでの最速記録は...${topResult}msね。`)
  }

  sortData (data) {
    data.sort(function (a, b) {
      return a - b
    })
  }

  calcRank (result) {
    this.sortData(this.dataJson)
    return this.dataJson.indexOf(result) + 1
  }

  saveResult (result) {
    this.dataJson.push(result)
    fs.writeFile('data/result.json', JSON.stringify(this.dataJson, null, 2), function (err, result) {
      if (err) console.log('error', err)
    })
  }

  async gameStart () {
    if (!fs.existsSync('./data/greeted.txt')) {
      await this.displayFirstMessage()
    }
    await this.checkStart()
    await this.countDown()
    await this.callPushEnter()
    const result = await this.measureTime()
    this.saveResult(result)
    this.resultAnnouncement(result, this.calcRank(result), this.dataJson[0])
  }

  showRank () {
    if (fs.existsSync('./data/result.json')) {
      console.log('いままでの記録はこんな感じよ。うふふ。')
      this.sortData(this.dataJson)
      for (let i = 0; i < 10; i++) {
        if (this.dataJson[i]) {
          console.log(`rank ${i + 1} : ${this.dataJson[i]} ms`)
        }
      }
    } else {
      console.log('あら...？まだ記録がないみたいよ...よかったらお店に寄っていってね...歓迎するわ。')
    }
  }

  deleteData () {
    if (readlineSync.keyInYN('> これまでの記録を消して、再出発したい...そういうことでいいかしら？')) {
      if (fs.existsSync('./data/result.json')) {
        fs.unlinkSync('./data/result.json')
        console.log(('記録を消しておいたわ。新たな挑戦の夜明け...ってところかしら。すてきね...。'))
      } else {
        console.log('あら...？まだ記録がないみたいよ...よかったらお店に寄っていってね...歓迎するわ。')
      }
    } else {
      console.log(('やっぱりやめておくのね。ボトルキープ...ではないけれど、あなたの記録がいつでも見れるようにしておくわね。'))
    }
  }
}

const reflexes = new Reflexes()

if (option.r) {
  reflexes.showRank()
} else if (option.d) {
  reflexes.deleteData()
} else {
  reflexes.gameStart()
}
