<!--
 * @Description:
 * @Author: chengyuming
 * @Date: 2019-09-03 19:50:53
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-09-14 15:00:23
 -->
<template>
  <div>
    <Common :sidebar="false" :isComment="false">
      <div class="content__default">
        <h2></h2>
      </div>
      <ul class="timeline-wrapper">
        <ModuleTransition>
          <li class="desc">{{ desc }}</li>
        </ModuleTransition>
        <li v-for="(item, index) in formatPagesArr" :key="index">
          <h3 class="year">{{item.year}}</h3>
          <ul class="year-wrapper">
            <li v-for="(subItem, subIndex) in item.data" :key="subIndex">
              <span class="date">{{dateFormat(new Date(subItem.frontmatter.date))}}</span>
              <span class="title" @click="go(subItem.path)">{{subItem.title}}</span>
            </li>
          </ul>
        </li>
      </ul>
    </Common>
  </div>
</template>

<script>
import Common from '@theme/components/Common'
import ModuleTransition from '@theme/components/ModuleTransition'
import moduleTransitonMixin from '@theme/mixins/moduleTransiton'
export default {
  name: 'TimeLine',
  mixins: [moduleTransitonMixin],
  components: { Common, ModuleTransition },
  data() {
    return {
      pages: [],
      tags: [],
      currentTag: '',
      currentPage: 1,
      formatPages: {},
      formatPagesArr: [],
      desc: '那年我背井离乡，导致一村子的人都没有水喝。'
    }
  },
  props: {
    tag: {
      type: String,
      default: ''
    }
  },
  computed: {
    trueCurrentTag() {
      return this.currentTag
    }
  },
  created() {
    this.getPages()
  },
  methods: {
    // 根据分类获取页面数据
    getPages(tag) {
      let pages = this.$site.pages
      pages = pages.filter(item => {
        const { home, isTimeLine, date, desc } = item.frontmatter
        if (desc) this.desc = desc
        return !(home == true || isTimeLine == true || date === undefined)
      })
      // reverse()是为了按时间最近排序排序
      this.pages = pages.length == 0 ? [] : pages
      for (let i = 0, length = pages.length; i < length; i++) {
        const page = pages[i]
        const pageDateYear = this.dateFormat(page.frontmatter.date, 'year')
        if (this.formatPages[pageDateYear]) this.formatPages[pageDateYear].push(page)
        else {
          this.formatPages[pageDateYear] = [page]
        }
      }


      for (let key in this.formatPages) {
        this.formatPagesArr.unshift({
          year: key,
          data: this.formatPages[key].sort((a, b) => {
            return this._getTimeNum(b) - this._getTimeNum(a)
          })
        })
      }
    },
    // 时间格式化
    dateFormat(date, type) {
      const dateObj = new Date(date)
      const year = dateObj.getFullYear()
      const mon = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      if (type == 'year') return year
      else return `${mon}-${day}`
    },
    // 跳转
    go(url) {
      this.$router.push({ path: url })
    },
    // 获取时间的数字类型
    _getTimeNum(date) {
      return parseInt(new Date(date.frontmatter.date).getTime())
    }
  }
}
</script>
<style src="../styles/theme.styl" lang="stylus"></style>
<style lang="stylus" scoped>
@require '../styles/wrapper.styl';

.timeline-wrapper {
  box-sizing: border-box;
  // max-width: 740px;
  max-width: $contentWidth;
  margin: 0 auto;
  position: relative;
  list-style: none;

  &::after {
    content: ' ';
    position: absolute;
    top: 14px;
    left: 0;
    margin-left: -2px;
    width: 4px;
    height: 100%;
    background: #f5f5f5;
  }

  .desc, .year {
    position: relative;
    color: #666;
    font-size: 16px;

    &:before {
      content: ' ';
      position: absolute;
      z-index: 2;
      left: -19px;
      top: 50%;
      margin-left: -4px;
      margin-top: -4px;
      width: 8px;
      height: 8px;
      background: #ddd;
      border-radius: 50%;
    }
  }

  .year {
    margin: 80px 0 0px;
    color: #555;
    font-weight: 700;
    font-size: 26px;
  }

  .year-wrapper {
    padding-left: 0 !important;

    li {
      display: flex;
      padding: 30px 0 10px;
      list-style: none;
      border-bottom: 1px dashed #ccc;
      position: relative;

      &:hover {
        .date {
          color: $accentColor;

          &::before {
            background: $accentColor;
          }
        }

        .title {
          color: $accentColor;
        }
      }

      .date {
        width: 40px;
        line-height: 30px;
        color: #555;
        font-size: 12px;

        &::before {
          content: ' ';
          position: absolute;
          left: -19px;
          top: 41px;
          width: 6px;
          height: 6px;
          margin-left: -4px;
          background: #ddd;
          border-radius: 50%;
          border: 1px solid #fff;
          z-index: 2;
        }
      }

      .title {
        line-height: 30px;
        color: #555;
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
}

@media (max-width: $MQMobile) {
  .timeline-wrapper {
    margin: 0 1.2rem;
  }
}
</style>
