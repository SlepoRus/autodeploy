const http = require('http');
const Git = require('nodegit');
const pathToRepo = require("path").resolve("../basic/interstart/"); //Url здесь
const log = require('winston');
const rmPick = 0;
const pass = "";
const login = "";
var _repos;
var _sha1;
var _sha2;
var deploy = () => {
  Git.Repository.open(pathToRepo).then(function (repo) {
    log.info('Выбрана директория = ' + repo.path());
    repo.getCurrentBranch().then(function(ref){
      log.info('Выбранная ветка ' + ref.name());
    }).catch(function(err) {
      log.error('Ошибка при выборе имени? ветки');
      log.error('err');
    });
    repo.getHeadCommit().then(function(com) {
      log.info('Последний коммит = ' + com.sha());
      _sha1 = com.sha();
      log.info('Дата : ' + com.date());
      log.info('Автор : ' + com.author().name())
    }).catch(function(err) {
      log.error('Возникла ошибка при выборе коммита!');
      log.error(err)
    });
    _repos = repo;
  }).catch(function(err) {
    log.error('Возникла ошибка при инициализации репозитория!');
    log.error(err)
  }).done(function() {
    setTimeout(function() {
      _repos.getRemotes().then(function(arr) {
        log.info('Возможные Remote');
        log.info(arr);
        log.info('Выбран ' + arr[rmPick]);
        log.info('Подключение к удаленному репозиторию');
        _repos.getRemote(arr[rmPick]).then(function(rem) {
          rem.connect(Git.Enums.DIRECTION.FETCH).then(function() {
            log.info('Подключение выполнено! Теребим соски');
            rem.referenceList().then(function(num) {
              log.info('Последний коммит в удаленном репозитории = ' + num[0].oid().tostrS());
              _sha2 = num[0].oid().tostrS();
              if (_sha1 && _sha2)
              {
                if (_sha2 === _sha1) {
                  log.info('Изменений не обнаружено');
                } else {
                  log.info('Обнаружены изменения, будет произведён git pull origin master');
                  _repos.fetchAll({
                    callbacks: {
                      credentials: function(url, userName) {
                        return nodegit.Cred.sshKeyFromAgent(userName);
                      },
                      certificateCheck: function() {
                        return 1;
                      }
                    }
                  });
                }
              } else {
                throw ('Ошибка в хэшах');
              }
            }).then(function() {
              return _repos.mergeBranches("master", "origin/master");
            }).catch(function(err) {
              log.error(err);
            }).done(function() {
              log.info('Все выполнено успешно');
              log.info('Следующий запуск запланирован через 15 минут');
              console.log('-------------------------------------------------------------------------');
            })
          }).catch(function(err) {
            log.error('Возникла ошибка при подключении')
            log.error(err);
          })
        }).catch(function(err) {
          log.error('Возникла ошибка при подключении!');
          log.error(err);
        });
      });
    },500);
  });
}

module.exports = deploy();
