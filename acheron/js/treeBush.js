const color_table=[
  "#F5B041","#52BE80","#2E86C1","#EC7063","#ff8080",
  "#ffb980","#edfa00","#00fa32","#0021fa","#8900fa","#c7041e"]
const rgb_gradients = [
  [["00","00","00"], ["FF","FF","FF"]],
  [["00","00","FF"], ["DF","DF","FF"]]
];
const flush_interval = 3000;
const scaled_entries_per_file = 128;
const name_table=["FADE", "MinOverlappingRatio", "Round-Robin"]
const name_table2=["FADE (1)", "FADE (2)", "FADE (3)"]
var traces_for_plots = {}
var plotted_metrics = ["num_deletes", "num_existing_tombstones",
  "num_expired_tombstones", "max_obsolete_age", "num_compactions",
  "avg_cmpct_lat","avg_cmpct_size","wc_compaction_lat","avg_ingest_cost",
    "write_amp", "storage_space", "memory_footprint"]
var default_value_for_metrics = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var global_workload_array = [new Array(), new Array(),new Array(),new Array()];
var in_progress_flag = false;
function intersection(x, y) {
  result = new Set();
  for(const i of x){
    if (y.has(i)) {
      result.add(i);
    }
  }
  return result;
}

// Event handling
document.addEventListener("DOMContentLoaded",
function (event) {
// picking_policy: 1 => Lethe,
//    2 => MinOverlappingRatio, 3 => Round-Robin
// N: number of ingets
// L: number of Levels
// KeySize : size of the key (bytes)
// E: size of an entry(bytes)
// T: size ratio
// M: actual buffer capacity(MB);
// bpk: bits-per-key allocated to bloomFilters
// Mf: memory allocated to FencePointers
// F: file size in #entries
// P: actual page size in bytes;
// B: page size in #entries
// PB:  buffer capacity in terms of #entries
// ceilling(M/B): #pages flushed by buffer;
// ceillign(N/B): #pages containing all entries
// ceilling(M/F): #files flushed by buffer;
// ceilling(N/F): #files containing all entries
// prefix: configurate target{cmp: comparative analysis, indiv: inidividual analysis}\
// suffix: result targets subclasses {lsm-cmpct-pp-1, lsm-cmpct-pp-2, lsm-cmpct-pp-3}
// preMP: previous state of merge policy before switching analysis mode
class RocksDBLSM {
  constructor(prefix = "", suffix = "", picking_policy) {
      this._DEFAULT = {
          T: 2,
          KeySize: 4,
          E: 1048576,
          N: 1,
          P: 1048576,
          M: 1048576, //1MB
          bpk: 10,
          Mf: 0,
          MP: 0,
          s: 50,
          mu: 1,
          phi: 1,
          Deletes: 1,
          DPT: 100,
          fileInfo: new Array(),
          numFiles:0,
          bg_compact: false,
          bg_threshold: 1.0
      };
      this.prefix = prefix;
      this.suffix = suffix;
      this.plotIdx = picking_policy - 1;
      this.prepared_flag = true;
      this.picking_policy = picking_policy;
      this.dpt_conf_prefix = "";
      if(prefix) {
          this.T = document.querySelector(`#${prefix}-input-T`).value;
          this.KeySize = convertToBytes(`#${prefix}-select-KeySize`,
            document.querySelector(`#${prefix}-input-KeySize`).value);
          this.E = convertToBytes(`#${prefix}-select-E`,
            document.querySelector(`#${prefix}-input-E`).value);
          this.N = document.querySelector(`#${prefix}-input-N`).value;
          this.M = convertToBytes(`#${prefix}-select-M`,
            document.querySelector(`#${prefix}-input-M`).value)
          this.P = convertToBytes(`#${prefix}-select-P`,
            document.querySelector(`#${prefix}-input-P`).value)
          this.bpk = parseFloat(
            document.querySelector(`#${prefix}-input-bpk`).value)
          //this.s = document.querySelector(`#${prefix}-input-s`).value;
          this.mu = convertToMilliSeconds(`#${prefix}-select-mu`,
            document.querySelector(`#${prefix}-input-mu`).value)
          this.phi = convertToMilliSeconds(`#${prefix}-select-phi`,
            document.querySelector(`#${prefix}-input-phi`).value)
          this.Deletes =
            document.querySelector(`#${prefix}-input-Deletes`).value
          this.DPT = convertToMilliSeconds(
            `#${prefix}-select` + this.dpt_conf_prefix +`-DPT`,
            getInputValbyId(`#${prefix}-input` + this.dpt_conf_prefix + `-DPT`))
      } else {
          this.T = this.DEFAULT.T;
          this.E = this.DEFAULT.E;
          this.N = this.DEFAULT.N;
          this.M = this.DEFAULT.M;
          this.P = this.DEFAULT.P;
          this.bpk = this.DEFAULT.bpk;
          //this.s = this.DEFAULT.s;
          this.mu = this.DEFAULT.mu;
          this.phi = this.DEFAULT.phi;
          this.PB = this.P * this.B;
          this.Deletes = this.DEFAULT.Deletes;
          this.DPT = this.DEFAULT.DPT;
      }
      this.NTotal = this.N;
      this.NTotalApproximate = getApproximateScaleDownInserts(
        this.NTotal, Math.round(this.M/this.E));
      this.PB = this.P * this.B;
      this.entries_per_file = Math.min(Math.round(this.M/this.E),
        scaled_entries_per_file);
      // this.L = this._getL();
    this.cumulativeMeta = [];
    this._clearCumulativeMeta();
    this.cumulativeData = new Array([[], [[]]]);
  }

  get structure(){
    return this.levels;
  }

  get slider() {
      if (this.prefix === "cmp") return window.cmpSlider;
      else return window.rlsmSlider;
  }

  show() {
      this.showBush();
      this.showCost();
      this.updatePlotData();
  }

  /* update current state */
  update(prefix) {
    this.prefix = prefix;

    var workload_idx = 0;
    if (prefix != "cmp"){
      workload_idx =  parseInt(prefix.at(prefix.length - 1));
    }

    var tmpE = convertToBytes(`#${prefix}-select-E`, document.querySelector(`#${prefix}-input-E`).value);
    var tmpM = convertToBytes(`#${prefix}-select-M`, document.querySelector(`#${prefix}-input-M`).value);
    var tmpNTotal = document.querySelector(`#${prefix}-input-N`).value;
    var tmpNTotalApproximate = getApproximateScaleDownInserts(tmpNTotal, Math.round(tmpM/tmpE));
    var tmpDeletes = document.querySelector(`#${prefix}-input-Deletes`).value;

    if (tmpNTotalApproximate != this.NTotalApproximate || tmpDeletes != this.Deletes) {
      this.E = tmpE;
      this.M = tmpM;
      this.NTotal = tmpNTotal;
      this.NTotalApproximate = tmpNTotalApproximate;
      this.Deletes = tmpDeletes;
      genWorkload(this.NTotalApproximate, this.Deletes, workload_idx);
      this.prepared_flag = false;
    }

    this.entries_per_file = Math.min(Math.round(this.M/this.E),
      scaled_entries_per_file);

    if (window.focusedTree == "default")
      this.progress_percentage = window.progressSlider.getValue();
    else
      this.progress_percentage = window.sliders[this.suffix].getValue();

    this.T = document.querySelector(`#${prefix}-input-T`).value;
    this.P = convertToBytes(`#${prefix}-select-P`,
      document.querySelector(`#${prefix}-input-P`).value);
    this.bpk = parseFloat(
      document.querySelector(`#${prefix}-input-bpk`).value);
    //this.s = document.querySelector(`#${prefix}-input-s`).value;
    this.mu = convertToMilliSeconds(`#${prefix}-select-mu`,
      document.querySelector(`#${prefix}-input-mu`).value);
    this.phi = convertToMilliSeconds(`#${prefix}-select-phi`,
      document.querySelector(`#${prefix}-input-phi`).value);

    this.DPT = convertToMilliSeconds(
      `#${prefix}-select` + this.dpt_conf_prefix + `-DPT`,
      getInputValbyId(`#${prefix}-input` + this.dpt_conf_prefix +`-DPT`));
    this.PB = this.P * this.B;

    if (!this.prepared_flag && in_progress_flag) {
      this._prepareCumulative(workload_idx);
      this.prepared_flag = true;
    }

  }

  showBush() {
    var btn_list = [];
    var createGlowBulb = function() {
      var lightbulb_icon = document.createElement("img");
      lightbulb_icon.src = "img/bulb_glow.png";
      lightbulb_icon.style.width = "24px";
      lightbulb_icon.style.height = "24px";
      lightbulb_icon.classList.add("blinker");
      return lightbulb_icon;
    }
    var createDarkBulb = function() {
      var lightbulb_icon = document.createElement("span");
      lightbulb_icon.classList.add("material-icons-outlined");
      lightbulb_icon.classList.add("md-18");
      lightbulb_icon.innerHTML = "lightbulb";
      return lightbulb_icon;
    }
    var blinkFunc = function() {
      if (document.querySelectorAll("img.blinker")){
        document.querySelectorAll("img.blinker")
          .forEach(function(item){
          item.src = "img/bulb_dark.png";
        });
      }

    }
    var getBtns = function(client_width, rocksdb_lsm_data,
        tree_structure, local_time, dpt) {
      var btn_list = [];
      var button = null;
      var context = "";
      var size = 0;
      var tombstone_color = "#FFFFFF";
      var entries_color = "#FFFFFF";
      var tombstone_width_percentage = 10;
      var width = Math.round(client_width/(Math.pow(rocksdb_lsm_data.T, 2) + 1));

      for (var i = 0; i < tree_structure.length; i++) {
        if (i >= 3 && i < tree_structure.length - 2) continue;
        if (tree_structure.length >= 5 && i == tree_structure.length - 2) {
          var btn_group = document.createElement("div")
          btn_group.setAttribute("class", `row lsm-btn-group`)
          btn_group.appendChild(createDots(client_width - width))
          btn_list.push(btn_group)
          continue
        }
        if (tree_structure[i].length > 0) {
          var btn_group = document.createElement("div")
          btn_group.setAttribute("class", `row lsm-btn-group`)
          if (i < 3 || (tree_structure[i].length <= Math.pow(rocksdb_lsm_data.T, 2) - 1 &&
            i == tree_structure.length - 1)) {
            if (i == tree_structure.length - 1) {
              // draw all buttons without next level files
              for (var j = 0; j < tree_structure[i].length; j++){
                var btn = createBtn(width, rocksdb_lsm_data.entries_per_file,
                  tree_structure[i][j], [], local_time, dpt)
                btn_group.appendChild(btn)
              }
            } else {
              // draw all buttons with next-level files in the last level
              for (var j = 0; j < tree_structure[i].length; j++){
                var btn = createBtn(width, rocksdb_lsm_data.entries_per_file,
                  tree_structure[i][j], tree_structure[i+1], local_time, dpt)
                btn_group.appendChild(btn)
              }
            }
          } else if (i == tree_structure.length - 1) {
            var tmp_width = 0
            // draw a few buttons, dots and the last button in the last level
            for (var j = 0; j < Math.min(Math.pow(rocksdb_lsm_data.T, 2) - 1, 4); j++){
              var btn = createBtn(width, rocksdb_lsm_data.entries_per_file,
                tree_structure[i][j], [], local_time, dpt)
              btn_group.appendChild(btn)
              tmp_width += parseFloat(btn.style['width'])
            }
            var last_btn = createBtn(width, rocksdb_lsm_data.entries_per_file,
              tree_structure[i][tree_structure[i].length - 1], [],
              local_time, dpt)
            tmp_width += parseFloat(last_btn.style['width'])
            var dots = createDots(client_width - tmp_width - width)
            btn_group.appendChild(dots)
            btn_group.appendChild(last_btn)
          }
          btn_list.push(btn_group)
        } else if (i < 3) {
          btn_list.push(createBtn(
            Math.min(client_width*0.85, Math.pow(width, i+1)*0.8),
            rocksdb_lsm_data.entries_per_file, null, [],
            local_time, dpt, true))
        }
      }
      // TBD (Zichen):
      // determine if not-shown status should appear in cumulativeData
      return btn_list
    }
    var parent = document.querySelector(`#${this.suffix}-bush`)

    var client_width = Math.ceil(parent.clientWidth * 0.9) - 1
    var btn_list = []
    var tree_structure = []
    var local_time = -1
    var compaction_start_level = -1
    var rendering_nodes = new Map()
    // level -> [[node idx1, node idx2, ..., node idxn],
    //        [style_map1, style_mape2, ..., style_mapN]]
    if (!document.getElementById("switch-for-update-granularity").checked) {
      if (this.progress_percentage >= this.cumulativeData.length) return;

      if (this.cumulativeData[this.progress_percentage]
        .hasOwnProperty('picked_file_idx')) {
        tree_structure = this.cumulativeData[this.progress_percentage - 1][1]
        local_time = this.cumulativeData[this.progress_percentage - 1][0]
        var picking_file_info = this.cumulativeData[this.progress_percentage]
        compaction_start_level = picking_file_info['output_level'] - 1
        rendering_nodes.clear();
        if (compaction_start_level <= 2) {
          rendering_nodes[compaction_start_level] = [new Array(), new Array()];
          rendering_nodes[compaction_start_level][0].
            push(picking_file_info['picked_file_idx']);
          rendering_nodes[compaction_start_level][1].push(new Map([
            ['border-style','solid'],
            ['border-width','thick'],
            ['border-color','red']
          ]));
        }

        if (compaction_start_level + 1 <= 2) {
          rendering_nodes[compaction_start_level + 1] = [new Array(), new Array()];
          for(var t = picking_file_info['overlap_start_idx'];
            t < picking_file_info['overlap_end_idx']; t++){
            rendering_nodes[compaction_start_level + 1][0].push(t);
            rendering_nodes[compaction_start_level + 1][1].push(new Map([
              ['border-width','medium'],
              ['border-style','dashed'],
              ['border-color','#FF9999']
            ]));
          }
        }

      } else if (this.cumulativeData[this.progress_percentage].
        hasOwnProperty('new_file_start_idx')) {
        tree_structure = this.cumulativeData[this.progress_percentage + 1][1]
        local_time = this.cumulativeData[this.progress_percentage + 1][0]
        var new_files_info = this.cumulativeData[this.progress_percentage]
        rendering_nodes.clear()
        if (new_files_info['output_level'] <= 2 ||
          (new_files_info['output_level'] == tree_structure.length - 1)) {
          rendering_nodes[new_files_info['output_level']] =
            [new Array(), new Array()]
          for(var t = new_files_info['new_file_start_idx'];
            t < new_files_info['new_file_end_idx']; t++){

            rendering_nodes[new_files_info['output_level']][0].push(t)
            rendering_nodes[new_files_info['output_level']][1].push(new Map([
              ['border-style','solid'],
              ['border-width','thick'],
              ['border-color','#33FF33']
            ]))
          }
        }
      } else if (this.cumulativeData[this.progress_percentage]
        .hasOwnProperty('sync_point')) {
          for (var i = this.progress_percentage - 1; i >= 0; i--){
            if (!this.cumulativeData[i].hasOwnProperty('sync_point')) {
              tree_structure = this.cumulativeData[i][1]
              local_time = this.cumulativeData[i][0]
              break
            }
          }
      } else {
        tree_structure = this.cumulativeData[this.progress_percentage][1]
        local_time = this.cumulativeData[this.progress_percentage][0]
      }
    } else {
      if (this.progress_percentage == 0) {
        tree_structure = this.cumulativeData[this.progress_percentage][1]
        local_time = this.cumulativeData[this.progress_percentage][0]
      } else {
        for (var i = 1; i < this.cumulativeData.length; i++){
          if (this.cumulativeData[i].hasOwnProperty('sync_point')) {
            if (this.cumulativeData[i]['sync_point'] ==
              this.progress_percentage - 1) {
                tree_structure = this.cumulativeData[i-1][1]
                local_time = this.cumulativeData[i-1][0]
                break
            }
          }
        }
      }
    }
    if (local_time == -1) {
      // cannot find tree structure to draw
      return
    }
    clear(parent)
    btn_list = getBtns(client_width, this, tree_structure,
      local_time, this.DPT)
    for (var i = 0; i < btn_list.length; i++) {
      var div_wrap = document.createElement("div")
      div_wrap.setAttribute("class", `row`)
      div_wrap.appendChild(btn_list[i])
      if (!(i == 3 && btn_list.length == 5)) {
        if (rendering_nodes.hasOwnProperty(i)) {
          var childNodes = btn_list[i].childNodes
          for(var j = 0; j < rendering_nodes[i][0].length; j++){
            var btn_idx = rendering_nodes[i][0][j]
            if (i != btn_list.length - 1 || btn_idx <= 2){
              for (const [key, value] of rendering_nodes[i][1][j]) {
                childNodes[btn_idx].style[key] = value
              }
            }
          }
        }

        if (i == compaction_start_level &&
          (i <= 3)) {
          div_wrap.appendChild(createGlowBulb())
        } else {
          div_wrap.appendChild(createDarkBulb())
        }
      } else {
        if (compaction_start_level >= 3 &&
          compaction_start_level < tree_structure.length - 2) {
          div_wrap.appendChild(createGlowBulb())
        } else {
          div_wrap.appendChild(createDarkBulb())
        }
      }
      parent.appendChild(div_wrap)
    }

    const blinkingId = setTimeout(blinkFunc, 350);
    window.blinkingId = blinkingId;
  }

  formatBytes(bytes,decimals) {
    if(bytes == 0) return '0 Byte';
     if(bytes < 1) return (bytes*8).toFixed(4) + ' ' + 'bits';
     var k = 1024; // or 1024 for binary
     var dm = decimals + 1 || 3;
     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', '(*1024) YB'];
     var i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  showCost() {
    var cumulativeMetaTmp = {}
    var sync_point_idx = 0
    if (this.progress_percentage == 0) return
    if (!document.getElementById("switch-for-update-granularity").checked) {
      if (this.progress_percentage >= this.cumulativeData.length) return
      var found_sync_point = false
      for (var i = this.progress_percentage; i >= 0; i--) {
        if (this.cumulativeData[i].hasOwnProperty('sync_point')) {
          found_sync_point = true
          sync_point_idx = this.cumulativeData[i]['sync_point']
          cumulativeMetaTmp = this.cumulativeMeta[sync_point_idx]
          break
        }
      }
      if (!found_sync_point) return
    } else {
      if (this.progress_percentage >= this.cumulativeMeta.length + 1) return
      sync_point_idx = this.progress_percentage - 1
      cumulativeMetaTmp = this.cumulativeMeta[this.progress_percentage - 1]
    }

    document.querySelector(`#${this.suffix}-num-deletes`)
      .textContent = cumulativeMetaTmp["num_deletes"]
    document.querySelector(`#${this.suffix}-num-existing-tombstones`)
      .textContent = cumulativeMetaTmp["num_existing_tombstones"]
    document.querySelector(`#${this.suffix}-num-expired-tombstones`)
      .textContent = cumulativeMetaTmp["num_expired_tombstones"]
    document.querySelector(`#${this.suffix}-max-obsolete-age`)
      .textContent = (cumulativeMetaTmp["max_obsolete_age"]/1000).toFixed(2) + " s"
    document.querySelector(`#${this.suffix}-num-compaction`)
      .textContent = cumulativeMetaTmp["num_compactions"]
    if (cumulativeMetaTmp["num_compactions"] == 0) {
      document.querySelector(`#${this.suffix}-compaction-size`)
        .textContent = "0 Bytes"
      document.querySelector(`#${this.suffix}-compaction-latency`)
        .textContent = 0
    } else {
      document.querySelector(`#${this.suffix}-compaction-size`)
        .textContent = this.formatBytes(cumulativeMetaTmp["total_cmpct_size"]
          /cumulativeMetaTmp["num_compactions"]*this.P, 2)
      document.querySelector(`#${this.suffix}-compaction-latency`)
        .textContent = (cumulativeMetaTmp["total_cmpct_lat"]
          /cumulativeMetaTmp["num_compactions"]).toFixed(2) + " ms"
    }

    document.querySelector(`#${this.suffix}-tail-compaction-latency`)
      .textContent = cumulativeMetaTmp["max_cmpct_lat"].toFixed(2) + " ms"
    document.querySelector(`#${this.suffix}-ingestion-cost`)
      .textContent = ((cumulativeMetaTmp["total_cmpct_lat"] +
      cumulativeMetaTmp["total_flush_lat"])*1000/(
        (sync_point_idx + 1)*this.M/this.E
      )).toFixed(2) + " \u03BCs"
    document.querySelector(`#${this.suffix}-write-amp`)
      .textContent = (cumulativeMetaTmp["total_write"]*this.P/(
        (sync_point_idx + 1)*this.M
      )).toFixed(2)
    document.querySelector(`#${this.suffix}-storage-cost`)
      .textContent = this.formatBytes(cumulativeMetaTmp["storage_space"], 3)
    document.querySelector(`#${this.suffix}-mem-cost`)
      .textContent = this.formatBytes(cumulativeMetaTmp["memory_footprint"], 3)
  }

  showDefaultCost() {
    document.querySelector(`#${this.suffix}-num-deletes`).textContent = 0
    document.querySelector(`#${this.suffix}-num-existing-tombstones`)
      .textContent = 0
    document.querySelector(`#${this.suffix}-num-expired-tombstones`)
      .textContent = 0
    document.querySelector(`#${this.suffix}-max-obsolete-age`).textContent = 0
    document.querySelector(`#${this.suffix}-num-compaction`).textContent = 0
    document.querySelector(`#${this.suffix}-compaction-size`)
      .textContent = "0 Bytes"
    document.querySelector(`#${this.suffix}-compaction-latency`)
      .textContent = 0
    document.querySelector(`#${this.suffix}-tail-compaction-latency`)
      .textContent = 0
    document.querySelector(`#${this.suffix}-ingestion-cost`).textContent = 0
    document.querySelector(`#${this.suffix}-write-amp`).textContent = 0
    document.querySelector(`#${this.suffix}-storage-cost`)
      .textContent = "0 Bytes"
    document.querySelector(`#${this.suffix}-mem-cost`).textContent = "0 Bytes"

    for(let i = 0; i < plotted_metrics.length; i++){
      traces_for_plots[plotted_metrics[i]][this.plotIdx].x = [];
      traces_for_plots[plotted_metrics[i]][this.plotIdx].y = [];
    }

  }
  updatePlotData() {
    var cumulativeMetaTmp = {};
    var sync_point_idx = 0
    if (this.progress_percentage == 0) return
    if (!document.getElementById("switch-for-update-granularity").checked) {
      if (this.progress_percentage >= this.cumulativeData.length) return;
      var found_sync_point = false
      for (var i = this.progress_percentage; i >= 0; i--) {
        if (this.cumulativeData[i].hasOwnProperty('sync_point')) {
          found_sync_point = true
          sync_point_idx = this.cumulativeData[i]['sync_point']
          break
        }
      }
      if (!found_sync_point) return
    } else {
      if (this.progress_percentage >= this.cumulativeMeta.length + 1) return
      sync_point_idx = this.progress_percentage - 1
    }

    for(let i = 0; i < plotted_metrics.length; i++){
      traces_for_plots[plotted_metrics[i]][this.plotIdx].x = [];
      traces_for_plots[plotted_metrics[i]][this.plotIdx].y = [];
    }

    var start_sync_point_idx = 0;
    while(start_sync_point_idx <= sync_point_idx){
      traces_for_plots[plotted_metrics[0]][this.plotIdx].x
        .push((start_sync_point_idx + 1)*this.M);
      // update data for plots
      cumulativeMetaTmp = this.cumulativeMeta[start_sync_point_idx];
      traces_for_plots[plotted_metrics[0]][this.plotIdx].y.push(
        cumulativeMetaTmp["num_deletes"]
      );
      traces_for_plots[plotted_metrics[1]][this.plotIdx].y.push(
        cumulativeMetaTmp["num_existing_tombstones"]
      );
      traces_for_plots[plotted_metrics[2]][this.plotIdx].y.push(
        cumulativeMetaTmp["num_expired_tombstones"]
      );
      traces_for_plots[plotted_metrics[3]][this.plotIdx].y.push(
        cumulativeMetaTmp["max_obsolete_age"]/1000
      );
      traces_for_plots[plotted_metrics[4]][this.plotIdx].y.push(
        cumulativeMetaTmp["num_compactions"]
      );
      if (cumulativeMetaTmp["num_compactions"] == 0) {
        traces_for_plots[plotted_metrics[5]][this.plotIdx].y.push(0);
        traces_for_plots[plotted_metrics[6]][this.plotIdx].y.push(0);
      } else {
        traces_for_plots[plotted_metrics[5]][this.plotIdx].y.push(
          cumulativeMetaTmp["total_cmpct_lat"]/
          cumulativeMetaTmp["num_compactions"]
        );
        traces_for_plots[plotted_metrics[6]][this.plotIdx].y.push(
          cumulativeMetaTmp["total_cmpct_size"]/
          cumulativeMetaTmp["num_compactions"]*this.P
        );

      }
      traces_for_plots[plotted_metrics[7]][this.plotIdx].y.push(
        cumulativeMetaTmp["max_cmpct_lat"]
      );
      traces_for_plots[plotted_metrics[8]][this.plotIdx].y.push(
        (cumulativeMetaTmp["total_cmpct_lat"] +
        cumulativeMetaTmp["total_flush_lat"])*1000/(
          (start_sync_point_idx + 1)*this.M/this.E
        )
      );
      traces_for_plots[plotted_metrics[9]][this.plotIdx].y.push(
        cumulativeMetaTmp["total_write"]*this.P/(
          (start_sync_point_idx + 1)*this.M
        )
      );
      traces_for_plots[plotted_metrics[10]][this.plotIdx].y.push(
        cumulativeMetaTmp["storage_space"]
      );
      traces_for_plots[plotted_metrics[11]][this.plotIdx].y.push(
        cumulativeMetaTmp["memory_footprint"]
      );
      start_sync_point_idx++;
    }

    for(let i = 1; i < plotted_metrics.length; i++){
      traces_for_plots[plotted_metrics[i]][this.plotIdx].x = traces_for_plots[plotted_metrics[0]][this.plotIdx].x;
    }

  }

  show() {
      this.showBush();
      this.showCost();
      this.updatePlotData();
  }

  merge(picked_file, overlapped_files, tombstone_removal_flag) {
    var picked_entries = new Set(picked_file.entries);
    var tombstones2timestamp = new Map();
    var output_entries = []
    for (var i = 0; i < overlapped_files.length; i++){
      for (const tombstone of overlapped_files[i].tombstones.keys()) {
        if (!picked_entries.has(tombstone) &&
          !picked_file.tombstones.has(tombstone) &&
          !tombstone_removal_flag) {
          output_entries.push(-tombstone);
          if (overlapped_files[i].hasOwnProperty("timestamp")) {
            tombstones2timestamp.set(tombstone,
              overlapped_files[i]["timestamp"]);
          } else {
            tombstones2timestamp.set(tombstone,
              overlapped_files[i].tombstones.get(tombstone));
          }
        }
      }
      for (var j = 0; j < overlapped_files[i].entries.length; j++) {
        if (!picked_file.tombstones.has(overlapped_files[i].entries[j]) &&
            !picked_entries.has(overlapped_files[i].entries[j])) {
          output_entries.push(overlapped_files[i].entries[j]);
        }
      }
    }
    if (!tombstone_removal_flag) {
      if (picked_file.hasOwnProperty("timestamp")) {
        for (const tombstone of picked_file.tombstones.keys()) {
          output_entries.push(-tombstone);
          tombstones2timestamp.set(tombstone, picked_file["timestamp"]);
        }
      } else {
        for (const tombstone of picked_file.tombstones.keys()) {
          output_entries.push(-tombstone);
          tombstones2timestamp.set(tombstone,
            picked_file.tombstones.get(tombstone));
        }
      }

    }

    for (const entry of picked_entries) {
      output_entries.push(entry);
    }
    output_entries.sort(function(a,b){
      if (Math.abs(a) < Math.abs(b)) {
        return -1;
      } else if (Math.abs(a) > Math.abs(b)) {
        return 1;
      } else {
        return 0;
      }
    });

    var k = 0;
    var end_idx;
    var new_files = [];
    while (true) {
      end_idx = Math.min(k + this.entries_per_file, output_entries.length);
      if (output_entries.length - end_idx < this.entries_per_file*0.15) {
        end_idx = output_entries.length;
      }
      var new_file = {
        tombstones:new Map(),
        entries: [],
        min_key: Math.abs(output_entries[k]),
        max_key: Math.abs(output_entries[end_idx-1]),
        oldest_tombstone_timestamp: Number.MAX_SAFE_INTEGER
      };
      var oldest_tombstone_timestamp = Number.MAX_SAFE_INTEGER;
      for (i = k; i < end_idx; i++) {
        if (output_entries[i] < 0) {
          var tmp_tombstone_timestamp =
            tombstones2timestamp.get(-output_entries[i]);
          oldest_tombstone_timestamp = Math.min(oldest_tombstone_timestamp,
            tmp_tombstone_timestamp);
          new_file.tombstones.set(-output_entries[i], tmp_tombstone_timestamp);
        } else {
          new_file.entries.push(output_entries[i]);
        }
      }
      new_file.oldest_tombstone_timestamp = oldest_tombstone_timestamp;
      new_files.push(structuredClone(new_file));
      if (end_idx >= output_entries.length) break;
      k = end_idx;
    }

    return new_files;
  }

  _prepareCumulative(workload_idx) {
    var i = 0;
    var end;
    var curr_time = 0;
    var tmp_time = 0; // summed time of flush and recursive compactions
    var found_expired_file = false;
    var sync_point_idx = 0;
    var scale_factor = 1.0;
    this._clearCumulativeMeta();
    this.cumulativeData = new Array([[], [[]]]);
    var round_robin_cursors = [];
    var cumulativeMetaTmp = {
      num_deletes: 0,
      num_existing_tombstones: 0,
      num_expired_tombstones: 0,
      max_obsolete_age: 0,
      num_compactions: 0,
      total_cmpct_lat: 0,
      total_cmpct_size: 0,
      max_cmpct_lat: 0,
      total_flush_lat: 0,
      total_write: 0,
      storage_space: 0,
      memory_footprint: 0
    }
    if (Math.round(this.M/this.E) >= scaled_entries_per_file) {
      scale_factor = Math.round(this.M/this.E)/scaled_entries_per_file;
    }
    while(true){
      end = i + this.entries_per_file;
      if (end > global_workload_array[workload_idx].length) {
        end = global_workload_array[workload_idx].length;
      }

      // fulfill one buffer
      var file = {tombstones:{}, entries: [], min_key:"", max_key:"",
        timestamp:curr_time,
        oldest_tombstone_timestamp:Number.MAX_SAFE_INTEGER};
      file.tombstones = new Set();
      var tmp_entries = new Set();
      var last_tree_structure;
      if (this.cumulativeData.length == 1) {
        last_tree_structure = structuredClone(
          this.cumulativeData[this.cumulativeData.length - 1][1]);
      } else {
        last_tree_structure = structuredClone(
          this.cumulativeData[this.cumulativeData.length - 2][1]);
      }

      var key_min_in_file = Math.abs(global_workload_array[workload_idx][i]);
      var key_max_in_file = Math.abs(global_workload_array[workload_idx][i]);
      for(var j = i; j < end; j++){
        var tmp_key = global_workload_array[workload_idx][j];
        if (tmp_key < 0) {
          if (tmp_entries.has(-tmp_key)) {
            tmp_entries.delete(-tmp_key);
          }
          file.tombstones.add(-tmp_key);
          key_min_in_file = Math.min(key_min_in_file, -tmp_key);
          key_max_in_file = Math.max(key_max_in_file, -tmp_key);
        } else {
          if (file.tombstones.has(tmp_key)) {
            file.tombstones.delete(tmp_key);
          }
          tmp_entries.add(tmp_key);
          key_min_in_file = Math.min(key_min_in_file, tmp_key);
          key_max_in_file = Math.max(key_max_in_file, tmp_key);
        }
      }
      for (const key of tmp_entries) {
        file.entries.push(key)
      }
      tmp_entries.clear();
      file.min_key = key_min_in_file;
      file.max_key = key_max_in_file;
      file.entries.sort();
      if (file.tombstones.size > 0){
        file.oldest_tombstone_timestamp = curr_time;
      }
      // all the data in level 0 before the current file are treated
      // as immutable MemTable

      // update cumulative number of deletes
      cumulativeMetaTmp["num_deletes"] += file.tombstones.size;
      if (last_tree_structure.length == 1) {
        tmp_time = (end - i - file.tombstones.size)*scale_factor*
          this.E/this.P*this.phi;
        file.tombstones.clear();
        cumulativeMetaTmp["total_write"] += (end - i - file.tombstones.size)*
          scale_factor*this.E/this.P
      } else {
        tmp_time = (end - i)*scale_factor*this.E/this.P*this.phi;
        cumulativeMetaTmp["total_write"] += (end - i)
          *scale_factor*this.E/this.P;
      }
      last_tree_structure[0].push(structuredClone(file));
      curr_time += tmp_time;
      cumulativeMetaTmp["total_flush_lat"] += tmp_time;
      tmp_time = 0;
      this.cumulativeData.push(
        [curr_time, last_tree_structure]);


      if (last_tree_structure[0].length >= 2) {
        // compaction starts
        var picked_file_idx = 0;
        var picked_file;
        var output_level = 1;
        var new_tree_structure;
        while(true){
          found_expired_file = false
          new_tree_structure = structuredClone(last_tree_structure);
          if (output_level == 1) {
            picked_file_idx = 0;
            picked_file = structuredClone(last_tree_structure[0][0]);
          } else {
            // picking policy differs here
            if (this.picking_policy == 3) {
              /*
              picked_file_idx = Math.floor(Math.random()*
              last_tree_structure[output_level-1].length);*/
              if (round_robin_cursors.length < output_level) {
                picked_file_idx = 0;
                round_robin_cursors.push(0);
                //round_robin_cursors.push(
                //  last_tree_structure[output_level-1][0].min_key);
              } else {
                if (round_robin_cursors[output_level-1] >=
                  last_tree_structure[output_level-1].length - 1) {
                  picked_file_idx = 0;
                  round_robin_cursors[output_level-1] = 0;
                } else {
                  picked_file_idx = round_robin_cursors[output_level-1] + 1;
                  round_robin_cursors[output_level-1] = picked_file_idx;
                }

                // picked_file_idx = -1;
                // for (var k1 = 0;
                //   k1 < last_tree_structure[output_level-1].length; k1++) {
                //
                //   if (last_tree_structure[output_level-1][k1].max_key >
                //     round_robin_cursors[output_level-1]) {
                //
                //     picked_file_idx = k1;
                //     round_robin_cursors[output_level-1] =
                //       last_tree_structure[output_level-1][k1].min_key;
                //     break;
                //   }
                // }
                //
                // if (picked_file_idx == -1) {
                //   picked_file_idx = 0;
                //   round_robin_cursors[output_level-1] =
                //     last_tree_structure[output_level-1][0].min_key;
                // }
              }
            } else if (this.picking_policy == 2) {
              var file_meta = new Array();
              if (last_tree_structure.length == output_level) {
                for (var k1 = 0;
                  k1 < last_tree_structure[output_level-1].length; k1++) {
                  file_meta.push({overlapped_count:0,
                    total_size:
                      last_tree_structure[output_level-1][k1].tombstones.size +
                      last_tree_structure[output_level-1][k1].entries.length,
                    file_idx:k1})
                }
                file_meta.sort(function(a,b){
                  if (a.total_size > b.total_size){
                    return -1;
                  } else if(a.total_size < b.total_size) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
              } else {
                var overlapped_count = 0;
                var k2 = 0;
                for (var k1 = 0;
                  k1 < last_tree_structure[output_level-1].length; k1++) {
                  while (k2 < last_tree_structure[output_level].length &&
                    last_tree_structure[output_level][k2].max_key <
                    last_tree_structure[output_level-1][k1].min_key) k2++;
                  while (k2 < last_tree_structure[output_level].length &&
                    last_tree_structure[output_level][k2].min_key <=
                    last_tree_structure[output_level-1][k1].max_key) {
                      overlapped_count++;
                      k2++;
                    }

                  file_meta.push({
                    overlapped_count:overlapped_count,
                    tombstone_size:
                      last_tree_structure[output_level-1][k1].tombstones.size,
                    file_idx:k1});

                  overlapped_count = 0;
                }
                file_meta.sort(function(a, b){
                  if (a.overlapped_count < b.overlapped_count) {
                    return -1;
                  } else if (a.overlapped_count == b.overlapped_count) {
                    if (a.tombstone_size > b.tombstone_size) {
                      return -1;
                    } else if (a.tombstone_size < b.tombstone_size) {
                      return 1;
                    }
                    return 0;
                  } else {
                    return 1;
                  }
                });
              }
              picked_file_idx = file_meta[0].file_idx;
            } else if (this.picking_policy == 1) {
              var file_meta = new Array();
              if (last_tree_structure.length == output_level) {
                for (var k1 = 0;
                  k1 < last_tree_structure[output_level-1].length; k1++) {
                  file_meta.push({
                    total_size:
                      last_tree_structure[output_level-1][k1].tombstones.size +
                      last_tree_structure[output_level-1][k1].entries.length,
                    file_idx:k1})
                }
                file_meta.sort(function(a,b){
                  if (a.total_size > b.total_size){
                    return -1;
                  } else if(a.total_size < b.total_size) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
              } else {
                var dpt_curr_level;
                if (last_tree_structure.length > 2) {
                  var base_level_wise_dpt = this.DPT*(this.T-1)/
                    (Math.pow(this.T, last_tree_structure.length-2) - 1);
                  dpt_curr_level = base_level_wise_dpt*
                    Math.pow(this.T,output_level-2);
                } else {
                  dpt_curr_level = this.DPT;
                }

                for (var k1 = 0;
                  k1 < last_tree_structure[output_level-1].length; k1++) {
                  file_meta.push({
                    time_to_expire: dpt_curr_level - curr_time +
                      last_tree_structure[output_level-1][k1]
                      .oldest_tombstone_timestamp,
                    tombstone_size:
                      last_tree_structure[output_level-1][k1].tombstones.size,
                    file_idx:k1});
                }
                file_meta.sort(function(a,b){
                  if (a.time_to_expire < 0 && b.time_to_expire < 0){
                    if (a.time_to_expire < b.time_to_expire) {
                      return -1;
                    } else if (a.time_to_expire > b.time_to_expire) {
                      return 1;
                    } else {
                      if (a.tombstone_size < b.tombstone_size) {
                        return 1;
                      } else if (a.tombstone_size > b.tombstone_size) {
                        return -1;
                      } else {
                        return 0;
                      }
                    }
                  } else if (a.time_to_expire < 0) {
                    return -1;
                  } else if (b.time_to_expire < 0) {
                    return 1;
                  } else {
                    if (a.tombstone_size < b.tombstone_size) {
                      return 1;
                    } else if (a.tombstone_size > b.tombstone_size) {
                      return -1;
                    } else {
                      return 0;
                    }
                  }
                });
              }
              //console.log(file_meta)
              picked_file_idx = file_meta[0].file_idx;
            }
            picked_file = structuredClone(
              last_tree_structure[output_level-1][picked_file_idx]);

          }
          new_tree_structure[output_level-1].splice(picked_file_idx, 1);
          var overlap_start_idx = -1;
          var overlap_end_idx = -1;

          if (output_level < last_tree_structure.length) {
            var overlapped_files = [];
            var next_level_files = last_tree_structure[output_level];
            // collect overlapping files
            for (var k = 0; k < next_level_files.length; k++) {
              if (next_level_files[k].min_key <= picked_file.max_key &&
                  next_level_files[k].max_key >= picked_file.min_key) {
                  if (overlap_start_idx == -1){
                    overlap_start_idx = k;
                  }
                  overlapped_files.push(next_level_files[k]);
              } else if (overlap_start_idx != -1 &&
                overlap_end_idx == -1) {
                overlap_end_idx = k;
              }
            }

            if (overlap_start_idx != -1 && overlap_end_idx == -1) {
              overlap_end_idx = next_level_files.length;
            }

            this.cumulativeData.push({
              "picked_file_idx":picked_file_idx,
              "output_level":output_level,
              "overlap_start_idx":overlap_start_idx,
              "overlap_end_idx":overlap_end_idx
            });

            if (overlap_start_idx == -1){
              // the picked file does not overlap with any file in the output level
              if (output_level == last_tree_structure.length - 1) {
                // clear tombstones in the last level
                picked_file.tombstones.clear();
              }

              // find the position to insert the picking file
              var new_file_start_idx = 0;
              while(new_file_start_idx < next_level_files.length &&
                next_level_files[new_file_start_idx].max_key < picked_file.min_key)
                new_file_start_idx++;

              if (new_file_start_idx == next_level_files.length) {
                new_tree_structure[output_level].push(picked_file);
                this.cumulativeData.push({
                  "new_file_start_idx":next_level_files.length,
                  "new_file_end_idx":next_level_files.length+1,
                  "output_level":output_level
                });
              } else {
                new_tree_structure[output_level].splice(
                  new_file_start_idx, 0, picked_file);
                this.cumulativeData.push({
                  "new_file_start_idx":new_file_start_idx,
                  "new_file_end_idx":new_file_start_idx + 1,
                  "output_level":output_level
                });
              }
              // trivial move does not involve any I/Os
            } else {
              cumulativeMetaTmp["num_compactions"] += 1;
              // start merging picked file and overlapped files
              new_tree_structure[output_level].splice(
                overlap_start_idx, overlap_end_idx - overlap_start_idx);
              var new_files = this.merge(picked_file, overlapped_files,
                output_level == new_tree_structure.length - 1);
              var tmp_time_cmpct = 0;
              var tmp_size_cmpct = 0;
              tmp_size_cmpct = (picked_file.tombstones.size +
                picked_file.entries.length)*scale_factor*this.E/this.P;
              for (var k = 0; k < overlapped_files.length; k++){
                tmp_size_cmpct += (overlapped_files[k].tombstones.size +
                  overlapped_files[k].entries.length)*scale_factor
                  *this.E/this.P;
              }
              tmp_time_cmpct += tmp_size_cmpct*this.mu;
              cumulativeMetaTmp["total_cmpct_size"] += tmp_size_cmpct;
              tmp_size_cmpct = 0;
              var insert_idx = overlap_start_idx;
              for (var k = 0; k < new_files.length; k++) {
                tmp_size_cmpct += (new_files[k].tombstones.size +
                  new_files[k].entries.length)*scale_factor*this.E/this.P;
                new_tree_structure[output_level].splice(
                  insert_idx + k, 0,
                  structuredClone(new_files[k]));
              }
              cumulativeMetaTmp["total_write"] += tmp_size_cmpct;
              tmp_time_cmpct += tmp_size_cmpct*this.phi;
              cumulativeMetaTmp["total_cmpct_lat"] += tmp_time_cmpct;
              cumulativeMetaTmp["max_cmpct_lat"] = Math.max(
                cumulativeMetaTmp["max_cmpct_lat"], tmp_time_cmpct);
              this.cumulativeData.push({
                "new_file_start_idx":insert_idx,
                "new_file_end_idx":insert_idx + new_files.length,
                "output_level":output_level
              });
              tmp_time += tmp_time_cmpct;
            }

            this.cumulativeData.push([
              tmp_time + curr_time,
              new_tree_structure]);

          } else if (output_level == last_tree_structure.length) {
            // clear tombstones in the last level
            // console.log(last_tree_structure[last_tree_structure.length - 1][0]);
            picked_file.tombstones.clear();
            // removing tombstones need to read and write the picking file
            var tmp_size_cmpct = 0;
            var tmp_time_cmpct = 0;
            cumulativeMetaTmp["num_compactions"] += 1;
            tmp_size_cmpct = (picked_file.tombstones.size +
              picked_file.entries.length)*scale_factor*this.E/this.P;
            cumulativeMetaTmp["total_cmpct_size"] += tmp_size_cmpct;
            tmp_time_cmpct = tmp_size_cmpct*this.mu;
            cumulativeMetaTmp["total_write"] += picked_file.entries.length*
              scale_factor*this.E/this.P;
            tmp_time_cmpct += picked_file.entries.length*scale_factor*
              this.E/this.P*this.phi;
            cumulativeMetaTmp["total_cmpct_lat"] += tmp_time_cmpct;
            cumulativeMetaTmp["max_cmpct_lat"] = Math.max(
              cumulativeMetaTmp["max_cmpct_lat"], tmp_time_cmpct
            );
            tmp_time += tmp_time_cmpct;
            new_tree_structure.push([picked_file]);
            this.cumulativeData.push({
              "picked_file_idx":picked_file_idx,
              "output_level":output_level,
              "overlap_start_idx":-1,
              "overlap_end_idx":-1
            });
            this.cumulativeData.push({
              "new_file_start_idx":0,
              "new_file_end_idx":1,
              "output_level":output_level
            });
            this.cumulativeData.push(
              [tmp_time + curr_time, new_tree_structure]);
            //break;
          } else {
            break;
          }

          if (new_tree_structure[output_level].length <=
            Math.pow(this.T, output_level)) {

            if (this.picking_policy == 1 && new_tree_structure.length > 2) {
              var base_level_wise_dpt = this.DPT*(this.T-1)/
                (Math.pow(this.T, new_tree_structure.length-2) - 1);
              var dpt_curr_level = this.DPT;
              for (var lvl = new_tree_structure.length - 2; lvl >= 1 ; lvl--) {

                for (var k = 0; k < new_tree_structure[lvl].length; k++) {
                  if (new_tree_structure[lvl][k].oldest_tombstone_timestamp <
                    curr_time + tmp_time - dpt_curr_level) {
                      output_level = lvl + 1
                      found_expired_file = true
                      break
                  }
                }
                dpt_curr_level = dpt_curr_level -
                  base_level_wise_dpt*Math.pow(this.T, lvl-1)
                if (found_expired_file) {
                  // at least found one expired file, no need to check other
                  // files, break the for loop to initiate the next compaction
                  break
                }
              }
              if (!found_expired_file) {
                // not found expired files, stop the compaction to output level
                break
              }
            } else {
              // picking policy does not enforce additional timstamp-based
              // check or 2-level does not have any out-dated tombstone
              break;
            }
          }
          last_tree_structure = new_tree_structure;
          if (!found_expired_file) {
            // continue the compaction to next output level from nominal
            // capacity-based compaction
            output_level++;
          }
          // continue the compaction with specified output level
        }
      }



      // collect meta data
      var tmp_num_existing_tombstones = 0
      var tmp_num_expired_tombstones = 0
      var tmp_max_obsolete_age = 0
      var expired_time = curr_time + tmp_time - this.DPT
      var tmp_storage_cost = 0
      var tmp_num_entries_per_file = 0
      var tmp_mem_cost = 0
      if (new_tree_structure == undefined) {
        new_tree_structure = last_tree_structure
      }
      for (var lvl = 1; lvl < new_tree_structure.length; lvl++) {
        for (var k = 0; k < new_tree_structure[lvl].length; k++) {
          if (new_tree_structure[lvl][k].tombstones.size > 0) {
            tmp_num_existing_tombstones +=
              new_tree_structure[lvl][k].tombstones.size
            if (expired_time >
              new_tree_structure[lvl][k].oldest_tombstone_timestamp) {
              for (const tmp_timestamp of
                new_tree_structure[lvl][k].tombstones.values()) {
                if (expired_time >= tmp_timestamp) {
                  tmp_num_expired_tombstones += 1
                }
              }
            }
            tmp_max_obsolete_age = Math.max(tmp_max_obsolete_age,
              curr_time + tmp_time - new_tree_structure[lvl][k].oldest_tombstone_timestamp)
          }
          tmp_num_entries_per_file =
            new_tree_structure[lvl][k].tombstones.size +
            new_tree_structure[lvl][k].entries.length
          tmp_storage_cost += tmp_num_entries_per_file*this.E*scale_factor
          // BFs
          tmp_storage_cost += tmp_num_entries_per_file*scale_factor*this.bpk/8
          // Indexes (4 bytes as offset)
          tmp_storage_cost += tmp_num_entries_per_file*this.E*scale_factor/this.P*(this.KeySize + 4)
          tmp_mem_cost += tmp_num_entries_per_file*scale_factor*this.bpk/8
          tmp_mem_cost += tmp_num_entries_per_file*this.E*scale_factor/this.P*(this.KeySize + 4)

        }
      }

      // we do not visualize concurrent flushes and compactions.
      // If flush_interval is less than the flush+recursive compactions, forcely
      // put off flushing
      // curr_time += Math.max(tmp_time, flush_interval)
      curr_time += tmp_time
      this.cumulativeData.push({"sync_point":sync_point_idx})

      cumulativeMetaTmp["max_obsolete_age"] = tmp_max_obsolete_age
      cumulativeMetaTmp["num_existing_tombstones"] =
        tmp_num_existing_tombstones
      cumulativeMetaTmp["max_obsolete_age"] = tmp_max_obsolete_age
      cumulativeMetaTmp["num_expired_tombstones"] = tmp_num_expired_tombstones
      cumulativeMetaTmp["storage_space"] = tmp_storage_cost
      cumulativeMetaTmp["memory_footprint"] = tmp_mem_cost
      this.cumulativeMeta.push(structuredClone(cumulativeMetaTmp))
      sync_point_idx++;
      if (end == global_workload_array[workload_idx].length) break;
      i = end;
    }
  }

  _clearCumulativeMeta() {
    this.cumulativeMeta = [];
  }
}

function progressAdvance() {
	//const currentVal = document.querySelector("#adjustable-progress-bar")["aria-valuenow"];
	//console.log("runTime");
    const currentVal = window.progressSlider.getValue();
    if (!in_progress_flag) {
         in_progress_flag = true;
        document.querySelector("#adjustable-progress-bar").dispatchEvent(new Event('change'));
    } else if (window.progressEventId && currentVal < window.progressSlider.getAttribute("max")) {
	    //changeProgressBar(currentVal + 1);
	    const newVal = currentVal  + 1;
	    //window.progressSlider.setValue(newVal);
	    changeProgressBar(window.progressSlider, newVal);
		var event = new Event('change');
		// var input_elem = document.querySelector("#cmp-input-N");
		var elem = document.querySelector("#adjustable-progress-bar");
		elem.dispatchEvent(event);
				//document.querySelector("#adjustable-progress-bar").onchange();
    } else {
		//console.log("Stttopppp", currentVal);
        clearInterval(window.progressEventId);
	}
}

function initPlot(){
  var local_name_table = name_table;
  if (document.getElementById("customRadio2").checked) {
    local_name_table = name_table2;
  }
  for(let i = 0; i < plotted_metrics.length; i++){
    traces_for_plots[plotted_metrics[i]] = [];
    for(let j = 0; j < 3; j++){
      traces_for_plots[plotted_metrics[i]].push({
        x: [],
        y: [],
        marker: {size: 5, opacity: 0.9, symbol: 'circle', color:color_table[j%color_table.length],"line": { "width": 2, color: color_table[j%color_table.length]}},
        mode: 'lines',
        line: {color:color_table[j%color_table.length], width: 3},
        showlegend: true,
        name: name_table[j],
        hovertemplate:
            "%{y:.2f}h",
        type: 'scatter'
      })
    }
  }
}

/* Initialize the configuration and tree bush reuslt
 * when indiv-analysis being displayed
 */
function initCmp() {
  var lsmCmpctPP1 = new RocksDBLSM("cmp", "lsm-cmpct-pp-1", 1);
  var lsmCmpctPP2 = new RocksDBLSM("cmp", "lsm-cmpct-pp-2", 2);
  var lsmCmpctPP3 = new RocksDBLSM("cmp", "lsm-cmpct-pp-3", 3);
  lsmCmpctPP1.showDefaultCost();
  lsmCmpctPP2.showDefaultCost();
  lsmCmpctPP3.showDefaultCost();
  genWorkload(lsmCmpctPP1.NTotalApproximate, lsmCmpctPP1.Deletes, 0);
  global_workload_array[1] = global_workload_array[0];
  global_workload_array[2] = global_workload_array[0];
  global_workload_array[3] = global_workload_array[0];

  window.lsmCmpctPP1 = lsmCmpctPP1;     // pass to global
  window.lsmCmpctPP2 = lsmCmpctPP2;
  window.lsmCmpctPP3 = lsmCmpctPP3;

  window.obj = {lsmCmpctPP1:window.lsmCmpctPP1,
      lsmCmpctPP2:window.lsmCmpctPP2,
      lsmCmpctPP3:window.lsmCmpctPP3};

  window.lsmCmpctPP1.update("cmp");
  window.lsmCmpctPP2.update("cmp");
  window.lsmCmpctPP3.update("cmp");

  window.lsmCmpctPP1.show();
  window.lsmCmpctPP2.show();
  window.lsmCmpctPP3.show();

  window.lsmCmpctPP1.prepared_flag = false;
  window.lsmCmpctPP2.prepared_flag = false;
  window.lsmCmpctPP3.prepared_flag = false;


	window.focusedTree = "default";
	window.individualProgress = new Map();
	window.individualProgress["lsmCmpctPP1"] = 0;
	window.individualProgress["lsmCmpctPP2"] = 0;
	window.individualProgress["lsmCmpctPP3"] = 0;
	window.compProgress = 0;
}

/* Initialize the gradient bar for tombstone age and
 * overlapping ratio
 */
function initGradientBar() {
  $('#gradient-show-ttl-1')
    .append("<div class='col-lg-2' " +
    "style='text-align: center;padding-top:5px;font-size:0.9em;" +
    "font-style:italic;margin:0px 0px'>" +
    "Max-Tombstone-Age &nbsp;<span " +
    "style='margin-top:15px;position:absolute;font-size:0.9em;margin-left:5px'>" +
    "(%):</span></div>")
  $('#gradient-show-ttl-2')
    .append("<div class='col-lg-2' " +
    "style='text-align: center;padding-top:5px;font-size:0.9em;" +
    "font-style:italic;margin:-3px 0px;text-decoration-line: overline;" +
    "-webkit-text-decoration-line: overline;'>" +
    "Persistence Threshold</div>")
  $('#gradient-show-overlapping-ratio')
    .append("<div class='col-lg-2' " +
    "style='text-align: center;padding-top:5px;font-size:medium;" +
    "font-style:italic;margin:0px 0px'>" +
    "Overlapping Ratio (%):</div>")

  for(var i = 0; i < 10; i++) {
    var tombstone_color = getColor((i+1)/10.0, 0)
    if (i == 9) {
      $('#gradient-show-ttl-1')
        .append("<div class='col-lg-1' " +
        "style='margin-top:20px;margin-bottom: -13px;color:#FFF;font-weight:500;background-color:"+
        tombstone_color+"'></div>")
    } else {
      $('#gradient-show-ttl-1')
        .append("<div class='col-lg-1' " +
        "style='margin-top:20px;margin-bottom: -13px;color:#00F;font-weight:500;background: " +
        "repeating-linear-gradient(45deg, #fff, #fff 2px,"+
        tombstone_color+" 2px," + tombstone_color + " 6px)'></div>")
    }
    $('#gradient-show-ttl-2')
      .append("<div class='col-lg-1' " +
      "style='margin:8px 0px;color:#000;font-weight:500;background:transparent'>" + (i+1)*10 + "%</div>")

    $('#gradient-show-overlapping-ratio')
      .append("<div class='col-lg-1' " +
      "style='margin:5px 0px;color:#FFF;font-weight:500;background-color:"+
      getColor((i+1)/10.0, 1)+"'> "+(i+1)*10+"%</div>")
  }
}
/* Display one of analysis mode according to
 * it's corresponding button triggers onlick event
 */
function display() {
  stopAllIndiv()
  changeProgressBar(window.progressSlider, 0);
  document.querySelector("#adjustable-progress-bar").onchange();
  clearInterval(window.progressEventId);
	window.progressEventId = null;
  in_progress_flag = false;

    switch (this.id) {
        case "customRadio1":
            ts = ["lsm-cmpct-pp-1","lsm-cmpct-pp-2","lsm-cmpct-pp-3"]
            for (var i = 0; i < 3; i++){
              $(`#cmp-${ts[i]}-title`).html(
                "<span>"+name_table[i]+"</span>")
              $(`#${ts[i]}-legend`).html(
                "<b>"+name_table[i]+"</b>")
              $(`#cmp-${ts[i]}-dpt`).hide()
            }
            // lsmCmpctPP1, lsmCmpctPP2, lsmCmpctPP3 are stored as value in
            // window.obj
            for (var key in window.obj) {
              var obj = window.obj[key]
              obj.picking_policy = parseInt(obj.suffix[obj.suffix.length - 1])
              obj.dpt_conf_prefix = ""
              obj.showDefaultCost()
            }
            $(`#shared-dpt-title`).show()
            $(`#shared-dpt-conf`).show()
            break;
        case "customRadio2":
            ts = ["lsm-cmpct-pp-1","lsm-cmpct-pp-2","lsm-cmpct-pp-3"]
            for (var i = 0; i < 3; i++){
              $(`#cmp-${ts[i]}-title`).html(
                "<span>"+name_table2[i]+"</span>")
              $(`#cmp-${ts[i]}-dpt`).show()
              $(`#${ts[i]}-legend`).html(
                "<b>"+name_table2[i]+"</b>")
            }
            for (var key in window.obj) {
              var obj = window.obj[key]
              obj.picking_policy = 1
              obj.dpt_conf_prefix = "-" + obj.suffix[obj.suffix.length - 1]
              obj.showDefaultCost()
            }
            $(`#shared-dpt-title`).hide()
            $(`#shared-dpt-conf`).hide()
            break;
        default:
            alert("Invalid: Unknown anlysis model selected")
    }
    runPlots()

}

function changeProgressBar(slider, newVal) {
	slider.setValue(newVal)
}

function runPlots(){
  if($("#show-plot-btn").offsetWidth <= 0 || $("#show-plot-btn").offsetHeight <= 0){
    return
  }
  var p_width = $("#num_deletes_plot").width()*0.9
  var title_template = {
    text:'Plot Title',
    font: {
      //family: 'Courier New, monospace',
      size: 15
    },
  }
  title_template.text = "#Deletes"
  var layout={
      height:p_width,
      width:p_width,
      title: title_template,
      margin: {
          l: 33,
          r: 0,
          b: 30,
          t: 30,
          pad: 0
      },
      showlegend: false,
  //     legend: {
  //   x: 0,
  //   xanchor: 'left',
  //   y: 1,
  //   font: {
  //     family: 'sans-serif',
  //     size: 8,
  //     color: '#000'
  //   },
  // },
      hovermode: false,
  }

  Plotly.newPlot('num_deletes_plot',
    traces_for_plots["num_deletes"],
    layout, {displayModeBar: false})

  //layout.title = "#Existing tombstones - Flushed Data";
  title_template.text = "#Tombstones"
  Plotly.newPlot('num_existing_tombstones_plot',
    traces_for_plots["num_existing_tombstones"],
    layout, {displayModeBar: false})

  //layout.title = "#Expired tombstones - Flushed Data";
  title_template.text = "#Expired tombstones"
  Plotly.newPlot('num_expired_tombstones_plot',
    traces_for_plots["num_expired_tombstones"],
    layout, {displayModeBar: false})

  //layout.title = "Max Obsolete Age (s) - Flushed Data";
  title_template.text = "Age of oldest tombstones"
  Plotly.newPlot('max_obsolete_age_plot',
    traces_for_plots["max_obsolete_age"],
    layout, {displayModeBar: false})

  //layout.title = "#compactions - Flushed Data";
  title_template.text = "#Compactions"
  Plotly.newPlot('num_compactions_plot',
    traces_for_plots["num_compactions"],
    layout, {displayModeBar: false})

  //layout.title = "Avg Cmpct Size (MB) - Flushed Data";
  title_template.text = "Avg Cmpct Size (MB)"
  Plotly.newPlot('avg_cmpct_size_plot',
    traces_for_plots["avg_cmpct_size"],
    layout, {displayModeBar: false})

  //layout.title = "Avg Cmpct Lat. (s) - Flushed Data";
  title_template.text = "Avg Cmpct Lat. (s)"
  Plotly.newPlot('avg_cmpct_lat_plot',
    traces_for_plots["avg_cmpct_lat"],
    layout, {displayModeBar: false})

  //layout.title = "Wc Cmpct Lat. (s) - Flushed Data";
  title_template.text = "Wc Cmpct Lat. (s)"
  Plotly.newPlot('wc_cmpct_lat_plot',
    traces_for_plots["wc_compaction_lat"],
    layout, {displayModeBar: false})

  //layout.title = "Ingest Cost (I/Os) - Flushed Data";
  title_template.text = "Ingest (I/Os)"
  Plotly.newPlot('ingest_cost_plot',
    traces_for_plots["avg_ingest_cost"],
    layout, {displayModeBar: false})

  title_template.text = "Write Amp"
  Plotly.newPlot('write_amp_plot',
    traces_for_plots["write_amp"],
    layout, {displayModeBar: false})

  title_template.text = "Storage Space (GB)"
  Plotly.newPlot('storage_space_plot',
    traces_for_plots["storage_space"],
    layout, {displayModeBar: false})

  title_template.text = "Memory Footprint (MB)"
  Plotly.newPlot('memory_footprint_plot',
    traces_for_plots["memory_footprint"],
    layout, {displayModeBar: false})

}

function getInput(target){
  var input_T = getInputValbyId(`#${target}-input-T`);
  var input_E = convertToBytes(`#${target}-select-E`,
    getInputValbyId(`#${target}-input-E`));
  var input_KeySize = convertToBytes(`#${target}-select-KeySize`,
    getInputValbyId(`#${target}-input-KeySize`));
  var input_N = getInputValbyId(`#${target}-input-N`);
  var input_M = convertToBytes(`#${target}-select-M`,
    getInputValbyId(`#${target}-input-M`));
  var input_P = convertToBytes(`#${target}-select-P`,
    getInputValbyId(`#${target}-input-P`));
  var input_bpk = parseFloat(
    getInputValbyId(`#${target}-input-bpk`));
  //var input_s = getInputValbyId(`#${target}-input-s`);
  //var input_mu = getInputValbyId(`#${target}-input-mu`);
  var input_phi = getInputValbyId(`#${target}-input-phi`);
  var input_Deletes = getInputValbyId(`#${target}-input-Deletes`);
  var input_DPT = convertToMilliSeconds(`#${target}-select-DPT`,
    getInputValbyId(`#${target}-input-DPT`));

  return {T: input_T, E: input_E, N: input_N,
    M: input_M, P: input_P, bpk: input_bpk, phi: input_phi,
    Deletes: input_Deletes, DPT: input_DPT, KeySize: input_KeySize};
}

function sync_cumulative_data(cumulativeDataList) {
  var sync_point_global_idx = 0;
  var sync_point_idxes = [];
  for (var i = 0; i < cumulativeDataList.length; i++) {
    sync_point_idxes.push(1);
  }
  var max_sync_point = -1;
  var origin_sync_point_idx = -1;
  while(true) {
    max_sync_point = -1;
    for (var i = 0; i < cumulativeDataList.length; i++) {
      while(!cumulativeDataList[i][sync_point_idxes[i]]
        .hasOwnProperty('sync_point') &&
        sync_point_idxes[i] < cumulativeDataList[i].length){
        sync_point_idxes[i]++;
      }
      while(sync_point_idxes[i] + 1 < cumulativeDataList[i].length &&
        cumulativeDataList[i][sync_point_idxes[i]+1]
          .hasOwnProperty('sync_point')){
        sync_point_idxes[i]++;
      }
      max_sync_point = Math.max(max_sync_point, sync_point_idxes[i]);
    }
    for (var i = 0; i < cumulativeDataList.length; i++) {
      origin_sync_point_idx = sync_point_idxes[i];
      while (sync_point_idxes[i] < max_sync_point) {
        cumulativeDataList[i].splice(sync_point_idxes[i], 0,
          cumulativeDataList[i][origin_sync_point_idx])
        sync_point_idxes[i]++;
      }
    }
    for (var i = 0; i < cumulativeDataList.length; i++) {
      sync_point_idxes[i]++;
    }
    if (cumulativeDataList[0].length <= sync_point_idxes[0]) {
      break;
    }
  }
}

function runCmp() {
  if (this.id.startsWith("cmp-input") && in_progress_flag) {
      clearInterval(window.progressEventId);
      window.progressEventId = null;
      $("#loader").show();

      lsmCmpctPP1.prepared_flag = false;
      lsmCmpctPP2.prepared_flag = false;
      lsmCmpctPP3.prepared_flag = false;

  }
	//console.log("ID:", this.id);
	var input_N = 0;
  var maxVal = 100;

	if (this.id == "adjustable-progress-bar"){
		stopAllIndiv();
		window.focusedTree = "default";
		const newVal = window.progressSlider.getValue();
		progress_percentage = newVal;
    maxVal = window.progressSlider.getAttribute("max");
		const newPercentage = Math.floor(newVal / maxVal * 100);
		document.getElementById("progress-percentage-label").innerHTML = newPercentage + "%";
	} else if (["lsm-cmpct-pp-1-progress-bar", "lsm-cmpct-pp-2-progress-bar", "lsm-cmpct-pp-3-progress-bar"].indexOf(this.id) != -1){
		switch (this.id) {
			case "lsm-cmpct-pp-1-progress-bar":
				window.focusedTree = "lsm-cmpct-pp-1"
				break
			case "lsm-cmpct-pp-2-progress-bar":
				window.focusedTree = "lsm-cmpct-pp-2";
				break
			case "lsm-cmpct-pp-3-progress-bar":
				window.focusedTree = "lsm-cmpct-pp-3"
				break
		}
		progress_percentage = window.sliders[window.focusedTree].getValue()

	}

  var target = "cmp"

  var input = getInput("cmp")
  validate(this, target, input)

  if (in_progress_flag) {
    switch (window.focusedTree) {
      case "default":
        lsmCmpctPP1.update(target);
        lsmCmpctPP2.update(target);
        lsmCmpctPP3.update(target);

        sync_cumulative_data([lsmCmpctPP1.cumulativeData,
        lsmCmpctPP2.cumulativeData,
        lsmCmpctPP3.cumulativeData]);
        if (document.getElementById("switch-for-update-granularity").checked) {
            maxVal = Math.max(
                lsmCmpctPP1
                    .cumulativeData[lsmCmpctPP1.cumulativeData.length - 1]["sync_point"],
                lsmCmpctPP2
                    .cumulativeData[lsmCmpctPP2.cumulativeData.length - 1]["sync_point"],
                lsmCmpctPP3
                    .cumulativeData[lsmCmpctPP3.cumulativeData.length - 1]["sync_point"],
            ) + 1;

            if (this.id == "switch-for-update-granularity") {
              var old_progress_val = window.progressSlider.getValue()
              var next_progress_val = 0
              var index = old_progress_val
              while (!lsmCmpctPP1.cumulativeData[index]
                .hasOwnProperty('sync_point')) index++
              next_progress_val = lsmCmpctPP1.cumulativeData[index]["sync_point"]
              index = old_progress_val
              while (!lsmCmpctPP2.cumulativeData[index]
                .hasOwnProperty('sync_point')) index++
              next_progress_val = Math.min(next_progress_val,
                lsmCmpctPP2.cumulativeData[index]["sync_point"])
              index = old_progress_val
              while (!lsmCmpctPP3.cumulativeData[index]
                .hasOwnProperty('sync_point')) index++
              next_progress_val = Math.min(next_progress_val,
                lsmCmpctPP3.cumulativeData[index]["sync_point"])
              window.progressSlider.setAttribute('max', maxVal - 1)
              changeProgressBar(window.progressSlider,
                next_progress_val)
            	document.getElementById("progress-percentage-label").innerHTML =
                Math.floor(next_progress_val / (maxVal - 1) * 100) + "%"
              window.progressSlider.progress_percentage =
                next_progress_val + 1
              lsmCmpctPP1.progress_percentage = next_progress_val + 1
              lsmCmpctPP2.progress_percentage = next_progress_val + 1
              lsmCmpctPP3.progress_percentage = next_progress_val + 1
            }

          } else {
            maxVal = Math.max(
                lsmCmpctPP1.cumulativeData.length,
                lsmCmpctPP2.cumulativeData.length,
                lsmCmpctPP3.cumulativeData.length
            );
            window.progressSlider.setAttribute('max', maxVal - 1);
            if (this.id == "switch-for-update-granularity") {
              var old_progress_val = window.progressSlider.getValue();
              var index = 0;
              while(index < lsmCmpctPP1.cumulativeData.length &&
                index < lsmCmpctPP2.cumulativeData.length &&
                index < lsmCmpctPP3.cumulativeData.length) {
                if (!lsmCmpctPP1.cumulativeData[index]
                  .hasOwnProperty('sync_point')){
                  index++;
                  continue;
                }
                if (lsmCmpctPP1.cumulativeData[index]['sync_point']
                   < old_progress_val) {
                  index++;
                  continue;
                }

                if (!lsmCmpctPP1.cumulativeData[index]
                  .hasOwnProperty('sync_point')){
                  index++;
                  continue;
                }
                if (lsmCmpctPP2.cumulativeData[index]['sync_point']
                   < old_progress_val) {
                  index++;
                  continue;
                }

                if (!lsmCmpctPP3.cumulativeData[index]
                  .hasOwnProperty('sync_point')){
                  index++
                  continue
                }
                if (lsmCmpctPP3.cumulativeData[index]['sync_point']
                   < old_progress_val) {
                  index++
                  continue
                }

                break
              }
              changeProgressBar(window.progressSlider,
                index)
              document.getElementById("progress-percentage-label").innerHTML =
                Math.floor(index / (maxVal - 1) * 100) + "%"
              lsmCmpctPP1.progress_percentage = index
              lsmCmpctPP2.progress_percentage = index
              lsmCmpctPP3.progress_percentage = index
            }

        }



        lsmCmpctPP1.show()
        lsmCmpctPP2.show()
        lsmCmpctPP3.show()
        break
      case "lsm-cmpct-pp-1":
        lsmCmpctPP1.update(target);
        if (document.getElementById("switch-for-update-granularity").checked) {
            window.sliders["lsm-cmpct-pp-1"]
                .setAttribute('max', lsmCmpctPP1
                    .cumulativeData[lsmCmpctPP1.cumulativeData.length - 1]["sync_point"]);
        } else {
            window.sliders["lsm-cmpct-pp-1"]
                .setAttribute('max', lsmCmpctPP1.cumulativeData.length);
        }

        sync_cumulative_data([lsmCmpctPP1.cumulativeData,
        lsmCmpctPP2.cumulativeData,
        lsmCmpctPP3.cumulativeData]);
        lsmCmpctPP1.show();
        break;
    case "lsm-cmpct-pp-2":
        lsmCmpctPP2.update(target);
        if (document.getElementById("switch-for-update-granularity").checked) {
            window.sliders["lsm-cmpct-pp-2"]
                .setAttribute('max', lsmCmpctPP2
                    .cumulativeData[lsmCmpctPP2.cumulativeData.length - 1]["sync_point"]);
        } else {
            window.sliders["lsm-cmpct-pp-2"]
                .setAttribute('max', lsmCmpctPP2.cumulativeData.length);
        }
        sync_cumulative_data([lsmCmpctPP1.cumulativeData,
        lsmCmpctPP2.cumulativeData,
        lsmCmpctPP3.cumulativeData]);
        lsmCmpctPP2.show();
        break;
    case "lsm-cmpct-pp-3":
        lsmCmpctPP3.update(target);
        if (document.getElementById("switch-for-update-granularity").checked) {
            window.sliders["lsm-cmpct-pp-3"]
                .setAttribute('max', lsmCmpctPP3
                    .cumulativeData[lsmCmpctPP3.cumulativeData.length - 1]["sync_point"]);
        } else {
            window.sliders["lsm-cmpct-pp-3"]
                .setAttribute('max', lsmCmpctPP3.cumulativeData.length);
        }
        sync_cumulative_data([lsmCmpctPP3.cumulativeData,
        lsmCmpctPP2.cumulativeData,
        lsmCmpctPP3.cumulativeData]);
        lsmCmpctPP3.show();
        break;
  }

  runPlots()
}


    if (in_progress_flag) {
        $("#loader").hide();
        if (this.id.startsWith("cmp-input")) {
            const id = setInterval(progressAdvance, 400);
            window.progressEventId = id;
        }
    }


}

/* General API for runing different tree bush
 * Event driven
 */

/* Validate and correct the input */
function validate(self, target, input) {
    // T >= 2, N, E > 1, M > 1
    switch (self.id) {
        case `${target}-input-T`:
            self.prepared_flag = false;
            if (input.T < 2 || !Number.isInteger(input.T)) {
                if (!Number.isInteger(input.T)) {
                    alert("Invalid input: the ratio of LSM-Tree should be an integer");
                    restoreInput(`#${target}-input-T`);
                    break;
                }
                if (input.T < 2) {
                    alert("Invalid input: the minimal ratio of LSM-Tree is 2");
                    restoreInput(`#${target}-input-T`);
                    break;
                }
            } else {
                setInput(`#${target}-input-T`);
            }
            break;
        case `${target}-input-DPT`:
            self.prepared_flag = false;
            break;
        case `${target}-input-N`:
            self.prepared_flag = false;
            if (input.N < 1 || !Number.isInteger(input.N)) {
                if (!Number.isInteger(input.N)) {
                    alert("Invalid input: the #entries should be an integer");
                    restoreInput(`#${target}-input-N`);
                    break;
                }
                if (input.N < 1) {
                    alert("Invalid input: the minimal #entries is 1");
                    restoreInput(`#${target}-input-N`);
                    break;
                }
            } else {
                setInput(`#${target}-input-N`);
            }
            break;
        case `${target}-input-KeySize`:
        case `${target}-select-KeySize`:
        case `${target}-input-E`:
        case `${target}-select-E`:
            if (input.K < 1 || input.E < 1 || input.E < input.KeySize ||
              input.E > input.M || input.E > input.P || input.E > input.F) {
                //restore to legally previous state
                if (input.KeySize < 1) {
                    alert("Invalid input: the minimal size of the key is 1 byte");
                    restoreInput(`#${target}-input-KeySize`, `#${target}-select-KeySize`);
                    break;
                }
                if (input.E < 1) {
                    alert("Invalid input: the minimal size of an entry is 1 byte");
                    restoreInput(`#${target}-input-E`, `#${target}-select-E`);
                    break;
                }
                if (input.E < input.KeySize) {
                    alert("Invalid input: the entry size has to be larger than the key size");
                    restoreInput(`#${target}-input-E`, `#${target}-select-E`);
                    restoreInput(`#${target}-input-KeySize`, `#${target}-select-KeySize`);
                    break;
                }
                if (input.E > input.P) {
                    alert("Invalid input: the maximal size of an entry should be <= page size");
                    restoreInput(`#${target}-input-E`, `#${target}-select-E`);
                    break;
                }
                if (input.E > input.F) {
                    alert("Invalid input: the maximal size of an entry should be <= file size");
                    restoreInput(`#${target}-input-E`, `#${target}-select-E`);
                    break;
                }
                if (input.E > input.M) {
                    alert("Invalid input: the maximal size of an entry should be <= buffer size");
                    restoreInput(`#${target}-input-E`, `#${target}-select-E`);
                    break;
                }
            } else {    // save new state
                setInput(`#${target}-input-E`, `#${target}-select-E`);
            }
            break;
        case `${target}-input-M`:
        case `${target}-select-M`:
            if (input.M < 1 || input.M < input.E || input.M < input.P || input.F < 1 || input.F < input.P) {
                if (input.F < input.P) {
                    alert("Invalid input: in terms of buffer, the corresponding file size shoud not be < page size");
                    restoreInput(`#${target}-input-M`, `#${target}-select-M`);
                    break;
                }
                if (input.F < 1) {
                    alert("Invalid input: in terms of buffer, the corresponding file size shoud not be < 1 byte");
                    restoreInput(`#${target}-input-M`, `#${target}-select-M`);
                    break;
                }
                if (input.M < input.P) {
                    alert("Invalid input: the minimal size of buffer should be >= page size");
                    restoreInput(`#${target}-input-M`, `#${target}-select-M`);
                    break;
                }
                if (input.M < input.E) {
                    alert("Invalid input: the minimal size of buffer should be >= entry size");
                    restoreInput(`#${target}-input-M`, `#${target}-select-M`);
                    break;
                }
                if (input.M < 1) {
                    alert("Invalid input: the minimal size of buffer is 1 byte");
                    restoreInput(`#${target}-input-M`, `#${target}-select-M`);
                    break;
                }
            } else {
                setInput(`#${target}-input-M`, `#${target}-select-M`);
            }
            break;
        case `${target}-input-P`:  //1byte <= P <= E & M & F
        case `${target}-select-P`:
            if (input.P < 1 || input.P < input.E || input.P > input.M || input.P > input.F) {
                if (input.P < input.E) {
                    alert("Invalid input: the minimal size of a page should be >= entry size");
                    restoreInput(`#${target}-input-P`, `#${target}-select-P`);
                    break;
                }
                if (input.P < 1) {
                    alert("Invalid input: the minimal size of a page should be >= 1 byte");
                    restoreInput(`#${target}-input-P`, `#${target}-select-P`);
                    break;
                }
                if (input.P > input.F) {
                    alert("Invalid input: the maximal size of a page should be <= file size");
                    restoreInput(`#${target}-input-P`, `#${target}-select-P`);
                    break;
                }
                if (input.P > input.M) {
                    alert("Invalid input: the maximal size of a page should be <= buffer size");
                    restoreInput(`#${target}-input-P`, `#${target}-select-P`);
                    break;
                }
            } else {
                setInput(`#${target}-input-P`, `#${target}-select-P`);
            }
            break;
        case `${target}-input-bpk`:  //0<= bpk
        case `${target}-select-bpk`:
            if (input.bpk < 0) {
                alert("Invalid input: the minimal bits-per-key allocated for" +
                  "bloom filters should be >= 0");
                restoreInput(`#${target}-input-bpk`);
            } else {
                setInput(`#${target}-input-bpk`);
            }
            break;
        case `${target}-input-f`:  //global setting: 1byte <= F <= M
            if (input.F < 1 || input.F < input.P || input.F < input.E || input.F > input.M) {
                if (input.F < input.P) {
                    alert("Invalid input: the minimal size of a file should be >= page size");
                    restoreInput("#cmp-input-f");
                    break;
                }
                if (input.F < input.E) {
                    alert("Invalid input: the minimal size of a file should be >= entry size");
                    restoreInput("#cmp-input-f");
                    break;
                }
                if (input.F < 1) {
                    alert("Invalid input: the minimal size of a file should be >= 1 byte");
                    restoreInput("#cmp-input-f");
                    break;
                }
                if (input.F > input.M) {
                    alert("Invalid input: in global setting, the maximal size of a file should be <= buffer size");
                    restoreInput("#cmp-input-f");
                    break;
                }
            } else {
                setInput("#cmp-input-f");
            }
            break;

        // case `${target}-input-s`:  //0 <= s <= 100
        //     if (input.s < 0 || input.s > 100) {
        //         if (input.s < 0) {
        //             alert("Invalid input: the selectivity of a range query should be >= 0");
        //             restoreInput(`#${target}-input-s`);
        //             break;
        //         }
        //         if (input.s > 100) {
        //             alert("Invalid input: the selectivity of a range query should be <= 100");
        //             restoreInput(`#${target}-input-s`);
        //             break;
        //         }
        //     } else {
        //         setInput(`#${target}-input-s`);
        //     }
        //     break;
        // // case `${target}-input-mu`:  //mu > 0
        //     if (input.mu <= 0) {
        //         alert("Invalid input: the storage read speed >= 0");
        //         restoreInput(`#${target}-input-mu`);
        //     } else {
        //         setInput(`#${target}-input-mu`);
        //     }
        //     break;
        case `${target}-input-phi`:  //phi > 0
            if (input.phi <= 0) {
                alert("Invalid input: the storage write speed should be >= 0");
                restoreInput(`#${target}-input-phi`);
            } else {
                setInput(`#${target}-input-phi`);
            }
            break;
        case `${target}-select-Mf`:  //TODO
        case `${target}-input-Mf`:  //TODO
        case `${target}-input-Deletes`:
        case `${target}-input-DPT`:
        case `${target}-bg-merging`:
        case `${target}-threshold`:
        // currently untriggered by event, unchanged merge policy
        // case `${target}-rlsm-leveling`:
        // case `${target}-rlsm-tiering`:
        // case `${target}-rlsm4-lazyLevel`:
        // case `${target}-rlsm3-tiering`:
        // case `${target}-rlsm3-leveling`:
            break;
		case "adjustable-progress-bar":
			break;
		case "lsm-cmpct-pp-1-progress-bar":
			break;
		case "lsm-cmpct-pp-2-progress-bar":
			break;
		case "lsm-cmpct-pp-3-progress-bar":
			break;
    case `switch-for-update-granularity`:
      break;
    default:
      //console.log(self.id);
      alert(`Invalid: Unknown ${target} configuration input`);
  }
    return;
}

function restoreInput(inputTarget, unitTarget) {
    var inputElem = document.querySelector(inputTarget);
    inputElem.value = inputElem.dataset.preval;
    if (unitTarget !== undefined) {
        var unitElem = document.querySelector(unitTarget);
        unitElem.selectedIndex = unitElem.dataset.preunit;
    }
}

function setInput(inputTarget, unitTarget) {
    var inputElem = document.querySelector(inputTarget);
    inputElem.dataset.preval = inputElem.value;
    if (unitTarget !== undefined) {
        var unitElem = document.querySelector(unitTarget);
        unitElem.dataset.preunit = unitElem.selectedIndex;
    }
}

function increaseInput() {
    var input_elem = this.parentElement.previousElementSibling;
    if (input_elem.step === "") {
        input_elem.value = nextPowerOfTwo(getInputVal(input_elem));
    } else if (input_elem.step == 10) {
		const nval = getInputValbyId("#cmp-input-N");
		const val = getInputVal(input_elem);
		if (nextPowerOfTen(val) < nval) {
			input_elem.value = nextPowerOfTen(val);
		} else {
			input_elem.value = nval;
		}
	}else {
    input_elem.value = correctDecimal(getInputVal(input_elem) + parseFloat(input_elem.step));
  }

  window.lsmCmpctPP1.prepared_flag = false;
  window.lsmCmpctPP1.cumulativeMeta = [];
  window.lsmCmpctPP2.prepared_flag = false;
  window.lsmCmpctPP2.cumulativeMeta = [];
  window.lsmCmpctPP3.prepared_flag = false;
  window.lsmCmpctPP3.cumulativeMeta = [];
}

function decreaseInput() {
    var input_elem = this.parentElement.previousElementSibling;
    if (input_elem.step === "") {
        input_elem.value = lastPowerOfTwo(getInputVal(input_elem));
    } else if (input_elem.step == 10) {
		const nval = getInputValbyId("#cmp-input-N");
		const val = getInputVal(input_elem);
		if (val == nval) {
			input_elem.value = lastPowerOfTen(nval);
		} else {
			input_elem.value = val / 10;
		}
	} else {
        input_elem.value = correctDecimal(getInputVal(input_elem) - parseFloat(input_elem.step));
    }

	if (this.id != "granularity-decrease") {
    	var event = new Event('change');
    	input_elem.dispatchEvent(event);
	}  else {
		window.granularity = input_elem.value;
	}

  window.lsmCmpctPP1.prepared_flag = false;
  window.lsmCmpctPP2.prepared_flag = false;
  window.lsmCmpctPP3.prepared_flag = false;

}

function startPlaying() {
	//if (this.playing) return;
    //this.playing = "playing";
    if (!in_progress_flag) {
        $("#loader").show();
    }

	var playingProgressBarId = "adjustable-progress-bar";
	var treeName = "default";
	if (this.id == "lsm-cmpct-pp-1-autoplay-button") {
		window.focusedTree = "lsm-cmpct-pp-1";
		this.src = "img/pause_circle_outline_black_24dp.svg"
		this.classList.remove("play-class");
		this.classList.add("pause-class");
		playingProgressBarId = "lsm-cmpct-pp-1-progress-bar";
		treeName = "lsm-cmpct-pp-1";
	}
	else if (this.id == "lsm-cmpct-pp-2-autoplay-button") {
		window.focusedTree = "lsm-cmpct-pp-2";
		this.src = "img/pause_circle_outline_black_24dp.svg"
		this.classList.remove("play-class");
		this.classList.add("pause-class");
		playingProgressBarId = "lsm-cmpct-pp-2-progress-bar"
		treeName = "lsm-cmpct-pp-2";
	}
	else if (this.id == "lsm-cmpct-pp-3-autoplay-button") {
		window.focusedTree = "lsm-cmpct-pp-3";
		this.src = "img/pause_circle_outline_black_24dp.svg"
		this.classList.remove("play-class");
		this.classList.add("pause-class");
		playingProgressBarId = "lsm-cmpct-pp-3-progress-bar"
		treeName = "lsm-cmpct-pp-3";
	}

	if (playingProgressBarId == "adjustable-progress-bar"){
		stopAllIndiv();
		var sliderElem = document.getElementById("control-panel").style.visibility = "visible";
		if (document.getElementById("progress-percentage-label").innerHTML == "100%") {
			changeProgressBar(window.progressSlider, 0);
		}

		const id = setInterval(progressAdvance, 400);
		window.progressEventId = id;
		//document.querySelector("#adjustable-progress-bar")["timeevent-id"] = id;
	}else {
		stopMain();
		const button = this;
		function localProgressAdvance() {
			var curProgress = window.sliders[treeName].getValue();
			const max = getInputValbyId("#cmp-input-N");
			// if (button.id == "rlsm4-autoplay-button") {
			// 	console.log("MAX =", max);
			// }
			if (curProgress >= max) {
				//clearInterval(window.runningIds[playingProgressBarId]);
				stopPlaying.call(button);
			} else {
				//console.log("coeff:" + coeff);
				const newVal = curProgress + 1;
				//window.progressSlider.setValue(newVal);
				//console.log("treeName:", treeName);
				changeProgressBar(window.sliders[treeName], newVal);
				window.individualProgress[treeName] = newVal;
				var event = new Event('change');
				//console.log("indivprogressbar: ", "#"+playingProgressBarId);
				document.querySelector("#" + playingProgressBarId).dispatchEvent(event);
				//document.querySelector("#" + playingProgressBarId).onchange();
			}
		}
		const localId = setInterval(localProgressAdvance, 500);
		window.runningIds[playingProgressBarId] = localId;
	}
}

function stopPlaying() {
	//console.log("Stopped:", this.id);
	if (this.id == "lsm-cmpct-pp-1-autoplay-button") {
		this.src = "img/play_circle_outline_black_24dp.svg";
		this.classList.remove("pause-class");
		this.classList.add("play-class");
		//console.log("Cleared lsm-cmpct-pp-1");
		clearInterval(window.runningIds["lsm-cmpct-pp-1-progress-bar"]);
		window.runningIds["lsm-cmpct-pp-1-progress-bar"] = null;
	} else if (this.id == "lsm-cmpct-pp-2-autoplay-button") {
		this.src = "img/play_circle_outline_black_24dp.svg";
		this.classList.remove("pause-class");
		this.classList.add("play-class");
		//console.log("Cleared rlsm");
		clearInterval(window.runningIds["lsm-cmpct-pp-2-progress-bar"]);
		window.runningIds["lsm-cmpct-pp-2-progress-bar"] = null;
	} else if (this.id == "lsm-cmpct-pp-3-autoplay-button") {
		this.src = "img/play_circle_outline_black_24dp.svg";
		this.classList.remove("pause-class");
		this.classList.add("play-class");
		//console.log("Cleared rlsm4");
		clearInterval(window.runningIds["lsm-cmpct-pp-3-progress-bar"]);
		window.runningIds["lsm-cmpct-pp-3-progress-bar"] = null;
	}else if (window.progressEventId) {
		//console.log("Cleared window");
		clearInterval(window.progressEventId);
		window.progressEventId = null;
		//this.previousElementSibling.playing = null;
	}
}

function resetProgress() {
	stopPlaying();
	//window.progressSlider.setValue(0);
    in_progress_flag = false;
	changeProgressBar(window.progressSlider, 0);
}

function finishProgress() {
    in_progress_flag = false;
	const maxVal = window.progressSlider.getAttribute("max");
	//window.progressSlider.setValue(maxVal);
	changeProgressBar(window.progressSlider, maxVal);
	document.querySelector("#adjustable-progress-bar").onchange();
	//console.log("Cleared fprogress");
	clearInterval(window.progressEventId);
	window.progressEventId = null;
}

function buttonChange() {
	if (this.classList.contains("play-class")) startPlaying.call(this);
	else if (this.classList.contains("pause-class")) stopPlaying.call(this);
}

function selectGranularity() {
	stopPlaying();
	resetProgress();
}

function clickProgressBar() {

}

function dragHandler() {
	//console.log("Drag handler called");
	stopMain();
	stopAllIndiv();
	var event = new Event('change');
	// var input_elem = document.querySelector("#cmp-input-N");
	this.dispatchEvent(event);
}

function getApproximateScaleDownInserts(num_of_inserts, entries_per_file){
  if(entries_per_file < scaled_entries_per_file){
    return num_of_inserts;
  } else{
    return Math.round(num_of_inserts/entries_per_file)*scaled_entries_per_file;
  }
}

function genWorkload(scaled_inserts, delete_percentage, workload_index){
  if(delete_percentage > 25) return;
  count = 0;
  tmp_workload_keys_list = new Array();
  tmp_workload_keys_to_list_idxes = new Map();
  deleted_idxes = new Array();
  while(count < scaled_inserts){
    if(Math.random()*100 < delete_percentage){
      if(tmp_workload_keys_to_list_idxes.size < 32 || tmp_workload_keys_list.length <= 4*deleted_idxes.length){
        continue;
      }
      var idx;
      while(true){
        idx = Math.floor(Math.random()*tmp_workload_keys_list.length);
        if(tmp_workload_keys_list[idx] >= 0){
          break;
        }
      }

      x = tmp_workload_keys_list[idx];
      tmp_workload_keys_to_list_idxes.delete(x);
      deleted_idxes.push(idx);
      global_workload_array[workload_index].push(-x); // negative number marked as deletes
      tmp_workload_keys_list[idx] = -1; // negative number marked as deletes
    }else{
      x = Math.round(Math.random()*scaled_inserts*1000);
      while(tmp_workload_keys_to_list_idxes.has(x)){
        x = Math.round(Math.random()*scaled_inserts*1000);
      }
      if (deleted_idxes.length != 0){
        tmp_workload_keys_list[deleted_idxes[deleted_idxes.length - 1]] = x;
        tmp_workload_keys_to_list_idxes.set(x, deleted_idxes[deleted_idxes.length - 1]);
        deleted_idxes.pop();
      } else {
        tmp_workload_keys_to_list_idxes.set(x, tmp_workload_keys_list.length);
        tmp_workload_keys_list.push(x);
      }

      global_workload_array[workload_index].push(x);
    }
    count++;
  }
  tmp_workload_keys_to_list_idxes.clear();
  tmp_workload_keys_list.length = 0;
}

function changeProgressCapacity(slider) {
	//console.log("Event Triggered");
	const newVal = getInputValbyId("#cmp-input-N");
	//window.progressSlider.setAttribute("max", newVal);
	if (this.id == "cmp-input-N") {
		window.progressSlider.setAttribute("max", newVal);
		window.sliders.forEach(function(slider) {slider.setAttribute("max", newVal);});
    //runCmp();
	}
}

function switchViewType() {
	if (this.id == "dynamic-view") {
		if (!this.classList.contains("btn-active")) {
			this.classList.add("btn-active");
			this.nextElementSibling.classList.remove("btn-active");
			document.querySelector("#control-panel").style["display"] = "block";
		}
	} else if (this.id == "static-view") {
		if (!this.classList.contains("btn-active")) {
			this.classList.add("btn-active");
			this.previousElementSibling.classList.remove("btn-active");
			document.querySelector("#control-panel").style["display"] = "none";
		}
	}
}
//Common Methods

function generateColor(colorStart,colorEnd,colorCount){
	start_r = parseInt(colorStart.substring(1, 3), 16);
  start_g = parseInt(colorStart.substring(3, 5), 16);
  start_b = parseInt(colorStart.substring(5, 7), 16);
  end_r = parseInt(colorEnd.substring(1, 3), 16);
  end_g = parseInt(colorEnd.substring(3, 5), 16);
  end_b = parseInt(colorEnd.substring(5, 7), 16);

	// The number of colors to compute
	var len = colorCount;
	//Alpha blending amount
	var alpha = 0.0;
	var result = [];
	for (i = 0; i < len; i++) {
		alpha += (1.0/len);
		r = Math.round(start_r * alpha + (1 - alpha) * end_r);
    r_str = r.toString(16)
    if (r_str.length <= 1) r_str = "0" + r_str
		g = Math.round(start_g * alpha + (1 - alpha) * end_g);
    g_str = g.toString(16)
    if (g_str.length <= 1) g_str = "0" + g_str
		b = Math.round(start_b * alpha + (1 - alpha) * end_b);
    b_str = b.toString(16)
    if (b_str.length <= 1) b_str = "0" + b_str
		result.push("#" + r_str+g_str+b_str);
	}
	return result;
}


/* FIXED precision of decimal eg. 0.1 + 0.2 = 0.3000000000000004
 * by rounding to a fixed number of decimal places of 15
 */
function correctDecimal(number) {
    return parseFloat(number.toPrecision(15));
}

function roundTo(number, digits) {
    return parseFloat(number.toFixed(digits));
}

function convertToMilliSeconds(target, input) {
  var selector = document.querySelector(target);
  var value = selector[selector.selectedIndex].value;
  switch (value) {
      case "0":  //s
          return parseFloat(input)*1000;
      case "1":  //min
          return parseFloat(input)*1000*60;
      case "2":  //ms
          return parseFloat(input);
      case "3":  //us
        return parseFloat(input)*0.001;
      default:
      //console.log(value);
      alert(`Invalid: Unknown value of unit in ${target}`);
  }
}

function convertToBytes(target, input) {
  var selector = document.querySelector(target);
  var value = selector[selector.selectedIndex].value;
  switch (value) {
      case "0":  //B
          return input;
      case "1":  //KB
          return input * Math.pow(2, 10);
      case "2":  //MB
          return input * Math.pow(2, 20);
      case "3":  //GB
          return input * Math.pow(2, 30);
      default:
      //console.log(value);
      alert(`Invalid: Unknown value of unit in ${target}`);
  }
}

function getInputValbyId(id) {
    return parseFloat(document.querySelector(id).value);
}

function getInputVal(elem) {
    return parseFloat(elem.value);
}

function setInputValbyId(id, val) {
    return document.querySelector(id).value = val;
}

function setInputVal(elem, val) {
    return elem.value = val;
}

function getBaseLog(x, y) {
    if (isNaN(x) || isNaN(y)) throw new TypeError("x: " + x +", y: " + y + " must be numbers");
    if (!(x > 0 && y > 0)) {
        throw new RangeError("x: " + x +", y: " + y + " both must > 0");
    } else {
        return correctDecimal(Math.log(y) / Math.log(x));
    }
}

function isPowerOfTwo(x) {
    if (isNaN(x)) throw new TypeError(x + " must be a number");
    if (x == 0) return false;
    else return x && !(x & (x - 1));
}

function nextPowerOfTwo(x) {
    // The reuslt should not less than 1
    if (isNaN(x)) throw new TypeError(x + " must be a number");
    if (x < 1) return 1;
    var exp = Math.ceil(getBaseLog(2, x));
    var result = Math.pow(2, exp);
    return (x === result) ? result * 2 : result;
}

function nextPowerOfTen(x) {
	// The reuslt should not less than 1
	if (isNaN(x)) throw new TypeError(x + " must be a number");
	if (x < 1) return 1;
	var exp = Math.ceil(getBaseLog(10, x));
	var result = Math.pow(10, exp);
	return (x === result) ? result * 10 : result;
}

function lastPowerOfTwo(x) {
    // The reuslt should not less than 1
    if (isNaN(x)) throw new TypeError(x + " must be a number");
    if (x <= 1) return 1;
    var exp = Math.floor(getBaseLog(2, x));
    var result = Math.pow(2, exp);
    return (x === result) ? result / 2 : result;
}

function lastPowerOfTen(x) {
	if (isNaN(x)) throw new TypeError(x + " must be a number");
    if (x <= 1) return 1;
    var exp = Math.floor(getBaseLog(10, x));
    var result = Math.pow(10, exp);
    return (x === result) ? result / 10 : result;
}

function getColor(rate, style_idx=1) {
  rgb = "#";
  if (rate > 1.0) rate = 1.0;
  for (var i = 0; i < 3; i++) {
    rgb = rgb +
    (Math.round(
      parseInt(rgb_gradients[style_idx][0][i],16)*rate +
      (1 - rate)*parseInt(rgb_gradients[style_idx][1][i],16)
    )).toString(16);
  }
  return rgb;
}

function setToolTip(elem, pos, text) {
    if (!(typeof pos === 'string' || pos instanceof String)) {
        throw new TypeError(pos + " must be a string or string object");
    } else if (!(pos == "left" || pos == "right" || pos == "top" || pos == "bottom")){
        throw new RangeError(pos + " must be a left or right or top or bottom");
    }
    elem.setAttribute("data-toggle", "tooltip");
    elem.setAttribute("data-placement", pos);
    elem.setAttribute("title", "" + text);
}

var tsHeightCoeff=32;
function setRunGradient(elem, rate1, file_num, rate2, full, lastLevel, spaceAmp) {
    spaceAmp*=100;
    var color1 = "#1e90ff"; // First file color
    var color2 = "#fff"; // White space
	var color3 = "#4169e1"; // Second file color
	var color4 = "#95a5a6"; // Grey. for the +x tabs.
    var color5 = "#1eff71"; // Green
    var color6 = "#00FFFF"; // Cyan
    var color7 = "#1ee8ff00"; // White
    var color7="#FF1E1E";//brighter red for tombstones in first file. color matched.
    var color8="#E14141";//darker/muted red for tombstones in second file. color matched.
    var colorR="rgba(255,0,0,1)";//red tombstone
    var colorG="rgba(192, 204, 92, 1)";//green file
    var colorY="rgba(255,255,0,1)";//yellow file
    var colorP="rgba(155, 116, 178)";//purple invalidated entry
    var colorB="#30D4DC"; //blue for picked file

    var unpickOpacity = 1;
    var colorRT=`rgba(255,0,0, ${unpickOpacity})`;//red transparent
    var colorGT=`rgba(192, 204, 92, ${unpickOpacity})`;//green transparent
    var colorYT=`rgba(255,255,0, ${unpickOpacity})`;//green transparent
    var colorPT=`rgba(155, 116, 178, ${unpickOpacity})`;//green transparent

    //var rate1 = file_num/pcap;
	const setFileColoring = function(rate, file_num) {
		//const step = unit_width * 100 ;
		const step = rate * 100 / file_num;
		for (let i = 0; i < file_num; i ++) {
			const stop = Math.min(step * (i + 1) , 100);
			if (i % 2 == 0) {
				coloring = coloring + `${color1} ${stop}%,0,`;
			} else {
				coloring = coloring + `${color3} ${stop}%,0,`;
			}
		}
		//console.log("Coloring: ", coloring);
		return coloring;
	}

	//var omission_width = unit_width * 2;
    if (rate1 === 0) {
        //rate1 = 0;
        rate2 = 0;
    }

    var coloring = "";//hoisting/global?
    var prev_style = elem.getAttribute("style");

    if (!file_num) {//level is empty. when starting
        elem.setAttribute("style", prev_style + `; background:
        linear-gradient(to right, rgba(240,240,240,0) ${rate1*100}%, 0, rgba(240,240,240,0) ${(1 - rate1)*100}%)`);
	} else if (!rate2){//when level is not "full" (no grey tab with +x)
        /**iterative rectangle populating for each level */
        var backgroundPosition = "";
        var backgroundImage = "";
        var rand1 = Math.random()*spaceAmp;
        var filePicked = Math.floor(Math.random()*file_num);
        //var rand2 = Math.random()*tsHeightCoeff;
        var rand3=Math.random()*spaceAmp;
        var rand4=Math.floor(Math.random()*255);
        colorRT=`rgba(${rand4}, 0,0, ${unpickOpacity})`;

        if(lastLevel){
            rand1 = 0;
            //rand2 = 0;
            rand3=Math.random()*spaceAmp;
        }

        var display_num = Math.ceil(1/(rate1/file_num));
        var filePicked = Math.floor(Math.random()*(file_num));
        if(display_num == 2){//file in level with only 2 files
            backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
            elem.setAttribute("style", prev_style + `; background: rgba(255,255,255,1) ${(rate1)*100}%;
            background-image: ${backgroundImage};
            background-repeat: no-repeat;
            background-size: 50%;
            background-position: 0%`);
        }else {
           for(i = 0; i < file_num; i++) {
                rand1 = Math.random()*spaceAmp;
                //rand2 = Math.random()*tsHeightCoeff;
                rand3=Math.random()*spaceAmp;
                var rand4=Math.floor(Math.random()*255);
                colorRT=`rgba(${rand4}, 0,0, ${unpickOpacity})`;

                if(lastLevel){
                    rand1 = 0;
                    rand3=Math.random()*spaceAmp;
                    //rand2 = 0;
                }

               if(i == file_num -1){//last file in level at any given time
                   backgroundPosition += `${((((display_num)/(display_num-1))*i-(1/(display_num+1)))/(file_num))*(rate1)*100}%`; //Not completely precise file sizes, but pretty close
                   if(i % 2 == 0){
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
                    } else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorGT} ${rand3}%)`;
                    }
                   }
                   else if(i % 2 == 1){
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
                    }else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorYT} ${rand3}%)`;
                    }
                   }
               }else if(i % 2 == 0) {//when there isn't a grey +x tab at the end of row
                if(i==filePicked && !lastLevel){
                    backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%),`;
                }else{
                    backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorGT} ${rand3}%),`;
                }
                backgroundPosition += `${((((display_num)/(display_num-1))*i-(1/(display_num+1)))/(file_num))*(rate1)*100}%, `;
               } else if(i % 2 == 1) {//when there isn't a grey +x tab at the end of row
                if(i==filePicked && !lastLevel){
                    backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%),`;
                }else{
                    backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorYT} ${rand3}%),`;
                }
                   backgroundPosition += `${((((display_num)/(display_num-1))*i-(1/(display_num+1)))/(file_num))*(rate1)*100}%, `;
               }
           }
            elem.setAttribute("style", prev_style + `; background: rgba(255,255,255,1);
            background-image: ${backgroundImage};
            background-repeat: no-repeat;
            background-size: ${((((display_num)/(display_num-1))-(1/(display_num-1)))/(file_num))*(rate1)*100}%;
            background-position: ${backgroundPosition}`);//Need to base this off of max displayed files in each level
        }
    } else if (full) {//not too sure what this does. full specified as true only 1x in runGradientWrapper
        var backgroundPosition = "";
        var backgroundImage = "";
        var rand1 = Math.random()*spaceAmp;
        var filePicked = Math.floor(Math.random()*file_num);
        //var rand2 = Math.random()*tsHeightCoeff;
        var rand3=Math.random()*spaceAmp;
        var rand4=Math.floor(Math.random()*255);
        colorRT=`rgba(${rand4}, 0,0, ${unpickOpacity})`;

        if(lastLevel){
            rand1 = 0;
            //rand2 = 0;
            rand3=Math.random()*spaceAmp*2;
        }
        if(file_num == 2){
            backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorB} ${rand1}%), linear-gradient( 0deg, ${colorR} ${rand2}%, ${colorB} ${rand2}%)`;
            elem.setAttribute("style", prev_style + `; background: rgba(255,255,255,1);
            background-image: ${backgroundImage};
            background-repeat: no-repeat;
            background-size: 33.333%;
            background-position: 0%, 50%`);
        }else {
            for(i = 0; i < file_num; i++) {
                 rand1 = Math.random()*spaceAmp;
                 rand3 = Math.random()*spaceAmp;
                 rand4=Math.floor(Math.random()*255);
                 colorRT=`rgba(${rand4}, 0,0, ${unpickOpacity})`;
                 //rand2 = Math.random()*tsHeightCoeff;

                 if(lastLevel){
                    rand1 = 0;
                    //rand2 = 0;
                    rand3=Math.random()*spaceAmp;
                }

                if(i == file_num -1){
                    backgroundPosition += `${(((file_num+2)/(file_num)*i-1/(file_num+2))/(file_num))*(rate1)*100}%`; //Need to base this off of max displayed files in each level
                    if(i % 2 == 0){
                        if(i==filePicked && !lastLevel){
                            backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
                        }else{
                            backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorGT} ${rand3}%)`;
                        }
                    }else if(i % 2 == 1){
                        if(i==filePicked && !lastLevel){
                            backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
                        }else {
                            backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorYT} ${rand3}%)`;
                        }
                   }
                }
                else if(i % 2 == 0) {
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%),`;
                    }else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorGT} ${rand3}%),`;
                    }
                    backgroundPosition += `${(((file_num+2)/(file_num)*i-1/(file_num+2))/(file_num))*(rate1)*100}%, `;
                }else if(i % 2 == 1) {
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%),`;
                    }else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorYT} ${rand3}%),`;
                    }
                    backgroundPosition += `${(((file_num+2)/(file_num)*i-1/(file_num+2))/(file_num))*(rate1)*100}%, `;
                }
            }

            elem.setAttribute("style", prev_style + `; background: rgba(255,255,255,1);
            background-image: linear-gradient(90deg, rgba(100, 100, 100, 1) 100%, rgba(255, 255, 255, 0) 0%), linear-gradient(90deg, rgba(100, 100, 100, 1) 100%, rgba(255, 255, 255, 0) 0%), ${backgroundImage};
            background-repeat: no-repeat;
            background-size: ${((file_num+2)/(file_num)/(file_num+1))*(rate1)*100}%;
            background-position: ${(((file_num+2)-1/(file_num+2))/(file_num))*(rate1)*100}%, 100%, ${backgroundPosition}`);
        }
	} else {//opposite of else if (!rate2). When grey tab appears.
        var backgroundPosition = "";
        var backgroundImage = "";
        var rand1 = Math.random()*spaceAmp;
        var filePicked = Math.floor(Math.random()*file_num);
        //var rand2 = Math.random()*tsHeightCoeff;
        var rand3=Math.random()*spaceAmp;
        var rand4=Math.floor(Math.random()*255);
        colorRT=`rgba(${rand4}, 0,0, ${unpickOpacity})`;

        if(lastLevel){
            rand1 = 0;
            //rand2 = 0;
            rand3=Math.random()*spaceAmp;
        }

        if(file_num == 2){
            if(i==filePicked && !lastLevel){
                backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorB} ${rand1}%), linear-gradient( 0deg, ${colorR} ${rand2}%, ${colorB} ${rand2}%)`;
            }else{
                backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorGT} ${rand1}%), linear-gradient( 0deg, ${colorRT} ${rand2}%, ${colorYT} ${rand2}%)`;
            }

        elem.setAttribute("style", prev_style + `; background: rgba(255,255,255,1);
        background-image: ${backgroundImage};
        background-repeat: no-repeat;
        background-size: 33.333%;
        background-position: 0%, 50%`);
        }else {
            for(i = 0; i < file_num; i++){
                 rand1 = Math.random()*spaceAmp;
                 //rand2 = Math.random()*tsHeightCoeff;
                 rand3=Math.random()*spaceAmp;
                 rand4=Math.floor(Math.random()*255);
                 colorRT=`rgba(${rand4}, 0,0, ${unpickOpacity})`;

                 if(lastLevel){
                    rand1 = 0;
                    //rand2 = 0;
                    rand3=Math.random()*Math.random()*spaceAmp*2;
                }

                if(i == file_num -1){
                    backgroundPosition += `${(((file_num+2)/(file_num)*i-1/(file_num+2))/(file_num))*(rate1)*100}%`; //Need to base this off of max displayed files in each level
                    if(i % 2 == 0){
                        if(i==filePicked && !lastLevel){
                            backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
                        }else{
                            backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorGT} ${rand3}%)`;
                        }
                   }
                   else if(i % 2 == 1) {
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%)`;
                    }
                    else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorYT} ${rand3}%)`;
                    }
                   }
                }
                else if(i % 2 == 0) {
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%),`;
                    }else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorGT} ${rand3}%),`;
                    }
                    backgroundPosition += `${(((file_num+2)/(file_num)*i-1/(file_num+2))/(file_num))*(rate1)*100}%, `;
                }
                else if(i % 2 == 1) {
                    if(i==filePicked && !lastLevel){
                        backgroundImage += `linear-gradient( 0deg, ${colorR} ${rand1}%, ${colorP} ${rand1}% ${rand3}%, ${colorB} ${rand3}%),`;
                    }else{
                        backgroundImage += `linear-gradient( 0deg, ${colorRT} ${rand1}%, ${colorPT} ${rand1}% ${rand3}%, ${colorYT} ${rand3}%),`;
                    }
                    backgroundPosition += `${(((file_num+2)/(file_num)*i-1/(file_num+2))/(file_num))*(rate1)*100}%, `;
                }
            }
             elem.setAttribute("style", prev_style + `; background: rgba(255,255,255,1);
             background-image: linear-gradient(90deg, rgba(100, 100, 100, 1) 100%, rgba(255, 255, 255, 0) 0%), linear-gradient(90deg, rgba(100, 100, 100, 1) 100%, rgba(255, 255, 255, 0) 0%), ${backgroundImage};
             background-repeat: no-repeat;
             background-size: ${((file_num+2)/(file_num)/(file_num+1))*(rate1)*100}%;
              background-position: ${(((file_num+2)-1/(file_num+2))/(file_num))*(rate1)*100}%, 100%, ${backgroundPosition}`); //VS If the equation for the background position
              //for the else case changes, the first part of this line also needs to change (with i = file_num plugged into the new background position equation)
        }
	}
}

function setRunGradientWrapper(button, entry_num, level_space, display_unit, lastLevel, spaceAmp) {
	//console.log("entry num ", entry_num);
    //entry_num = level_space; //VS Causes it to populate the entire level at once
	const width = button.style.width.slice(0, -2);
	//console.log("display unit: ", display_unit);
	//console.log("width: ", width);
	//console.log("rate: ", (display_unit * entry_num) / width);
	//console.log("level space: ", level_space);
	if (Math.round(width / display_unit) < level_space && width / display_unit <= entry_num + 1 && level_space > 4) {
		const display_num = Math.ceil(width / display_unit);
		if (entry_num < level_space) {
            if(lastLevel){
                setRunGradient(button, (display_num - 3) * display_unit / width, display_num - 3, 1 - display_unit / width, false, true, spaceAmp);
            }else{
                setRunGradient(button, (display_num - 3) * display_unit / width, display_num - 3, 1 - display_unit / width, false, false, spaceAmp);
            }
			var ellipsis_node = document.createElement("span");
			ellipsis_node.classList.add("ellipsis");
			ellipsis_node.style['position'] = "absolute";
			ellipsis_node.style['left'] = ((display_num - 2.2) * display_unit) + "px";
			ellipsis_node.style['width'] = (width - (display_num - 2) * display_unit) + "px";
			//ellipsis_node.style['height'] = 0.5 * button.style.height.slice(0, -2) + "px";
			//console.log("top:", ellipsis_node.style['top']);
			//ellipsis_node.align = "center";
			ellipsis_node.innerHTML = "+" + (entry_num - display_num + 3);
			button.style['position'] = "relative";
			button.appendChild(ellipsis_node);
			/*var lightbulb_icon = document.createElement("span");
			lightbulb_icon.classList.add("material-icons");
			lightbulb_icon.innerHTML = "lightbulb";
			button.appendChild(lightbulb_icon);*/
		} else {
            if(lastLevel){
                setRunGradient(button, (display_num - 3) * display_unit / width, display_num - 3, 1 - display_unit / width, true, true, spaceAmp);
            }else{
                setRunGradient(button, (display_num - 3) * display_unit / width, display_num - 3, 1 - display_unit / width, true, false, spaceAmp);
            }
			var ellipsis_node = document.createElement("span");
			ellipsis_node.classList.add("ellipsis");
			ellipsis_node.style['position'] = "absolute";
			ellipsis_node.style['left'] = ((display_num - 2.2) * display_unit) + "px";
			ellipsis_node.style['width'] = (width - (display_num - 2) * display_unit) + "px";
			//ellipsis_node.style['height'] = 0.5 * button.style.height.slice(0 , -2) + "px";
			//console.log("top:", ellipsis_node.style['top']);
			//ellipsis_node.align = "center";
			ellipsis_node.innerHTML = "...";
			button.style['position'] = "relative";
			button.appendChild(ellipsis_node);
			/*var lightbulb_icon = document.createElement("span");
			lightbulb_icon.classList.add("material-icons-outlined");
			lightbulb_icon.innerHTML = "lightbulb";
			button.appendChild(lightbulb_icon);*/
		}
	} else {
        if(lastLevel){
            setRunGradient(button, entry_num * display_unit / width, entry_num, false, false, true, spaceAmp);
        }else{
            setRunGradient(button, entry_num * display_unit / width, entry_num, false, false, false, spaceAmp);
        }
		/*var lightbulb_icon = document.createElement("span");
		lightbulb_icon.classList.add("material-icons-outlined");
		lightbulb_icon.innerHTML = "lightbulb";
		button.appendChild(lightbulb_icon);*/
	}
}

function createDots(width) {
    var dots = document.createElement("span");
    dots.setAttribute("class", "abbr-dot text-center");
    dots.setAttribute("style", "width:" + width + "px");
    dots.textContent = "..."
    return dots;
}

function createBtn(max_width, entries_per_file, file,
  next_level_files, local_time, dpt, empty_flag=false) {
  var btn = document.createElement("button");
  var context;
  btn.setAttribute("type", "button");
  btn.setAttribute("class", "lsm-btn btn btn-secondary");

  if (empty_flag) {
    btn.setAttribute("style","width:" + max_width + "px;" +
      "background:#fff; border:dotted; border-color:#000");
    context = "There does not exist any data in this level."
  } else {
    var size = file.tombstones.size + file.entries.length;
    var tombstone_width_percentage = 0;
    var entries_color = getColor(1.0, 1);
    if (next_level_files != []){
      var overlapped_count = 0;
      for(const f of next_level_files) {
        if (f.max_key >= file.min_key &&
          f.min_key <= file.max_key) {
          overlapped_count++;
        }
        entries_color =
          getColor(overlapped_count/next_level_files.length, 1);
      }
    }
    var background = "";
    if (file.tombstones.size > 0) {
      tombstone_width_percentage = Math.min(
        Math.ceil(100*file.tombstones.size/size), 25);
      var max_obsolete_time_ratio = 0;
      if (file.hasOwnProperty('timestamp')) {
        max_obsolete_time_ratio = (local_time - file.timestamp)/dpt;
      } else {
        max_obsolete_time_ratio =
          (local_time - file.oldest_tombstone_timestamp)/dpt;
      }
      var tombstone_color = getColor(max_obsolete_time_ratio, 0);
      if (max_obsolete_time_ratio >= 1.0) {
        background = "linear-gradient(to right, " + tombstone_color + " " +
          tombstone_width_percentage + "%, " + entries_color + " " +
          tombstone_width_percentage + "%)";
      } else {
        background = "linear-gradient(to right, transparent " +
          tombstone_width_percentage + "%, " + entries_color + " " +
          tombstone_width_percentage + "%), " +
          "repeating-linear-gradient(45deg, #fff, #fff 2px, " +
          tombstone_color + " 2px," + tombstone_color + " 6px)";
      }

    } else {
      background = entries_color;
    }

    btn.setAttribute("style", "width:" +
      Math.round(max_width*size/entries_per_file) + "px; " +
      "background:" + background);

    context = "This file contains " + file.tombstones.size +
      " tombstones and " + file.entries.length +
      " valid entries."
  }

  //setToolTip(btn, "left", context);
  return btn;
}

function showElem(query) {
    var elementList = document.querySelectorAll(query);
    for (let elem of elementList) {
        elem.style.display = "";
    }
}

function hideElem(query) {
    var elementList = document.querySelectorAll(query);
    for (let elem of elementList) {
        elem.style.display = "none";
    }
}

function clear(element) {
	clearTimeout(window.blinkingId);
    while (element.firstChild) {
		if (element.firstChild.firstChild) {
			var btns = element.firstChild.firstChild.childNodes;
			//console.log(btns);
			for (var btn_i in btns) {
				$(btn_i).tooltip('hide');
        //$(btns[i]).tooltip("option", "disabled", true);
			}
		}
		if (element.firstChild.firstChild) $(element.firstChild.firstChild).tooltip('dispose');
        element.removeChild(element.firstChild);
    }
}

function clearGroups(element) {
	clearTimeout(window.blinkingId);
	while (element.firstChild) {
		var btns = element.firstChild.childNodes;
	}
}

function initSlider() {

	window.progressSlider = new Slider("#adjustable-progress-bar", {
		formatter: function(value) {
			return value;
		},
		value: 0,
		precision: 20,
		max: 100
	});
	window.progressSlider.on("slideStop", dragHandler);

	window.progressSlider.max = getInputValbyId("#cmp-input-N");

	window.lsmCmpctPP1ProgressSlider = new Slider("#lsm-cmpct-pp-1-progress-bar", {
		formatter: function(value) {
			return value;
		},
		value: 0,
		precision: 20,
		max: getInputValbyId("#cmp-input-N")
	});
	window.lsmCmpctPP1ProgressSlider.on("slideStop", dragHandler);


	window.lsmCmpctPP2ProgressSlider = new Slider("#lsm-cmpct-pp-2-progress-bar", {
		formatter: function(value) {
			return value;
		},
		value: 0,
		precision: 20,
		max: getInputValbyId("#cmp-input-N")
	});
	window.lsmCmpctPP2ProgressSlider.on("slideStop", dragHandler);

	window.lsmCmpctPP3ProgressSlider = new Slider("#lsm-cmpct-pp-3-progress-bar", {
		formatter: function(value) {
			return value;
		},
		value: 0,
		precision: 20,
		max: getInputValbyId("#cmp-input-N")
	});
	window.lsmCmpctPP3ProgressSlider.on("slideStop", dragHandler);

	window.sliders = new Map();
	window.sliders["lsm-cmpct-pp-1"] = window.lsmCmpctPP1ProgressSlider;
	window.sliders["lsm-cmpct-pp-2"] = window.lsmCmpctPP2ProgressSlider;
	window.sliders["lsm-cmpct-pp-3"] = window.lsmCmpctPP3ProgressSlider;
	window.runningIds = new Map();
}

function stopMain() {
	stopPlaying.call(document.querySelector("#autoplay-button"))
}

function stopAllIndiv() {

	stopPlaying.call(document.querySelector("#lsm-cmpct-pp-1-autoplay-button"))
	stopPlaying.call(document.querySelector("#lsm-cmpct-pp-2-autoplay-button"))
	stopPlaying.call(document.querySelector("#lsm-cmpct-pp-3-autoplay-button"))
  changeProgressBar(window.lsmCmpctPP1ProgressSlider, 0)
  changeProgressBar(window.lsmCmpctPP2ProgressSlider, 0)
  changeProgressBar(window.lsmCmpctPP3ProgressSlider, 0)
}

// var mySlider = new Slider("#cmp-threshold", {
//     formatter: function(value) {
//         return value + "%";
//     },
//     value: 5,
//     precision: 20
// });
initPlot()
initSlider()
initCmp()
initGradientBar()

// Event attributes, trigger
// Analysis mode selection trigger
document.querySelector("#customRadio1").onclick = display
document.querySelector("#customRadio2").onclick = display
// Comparative LSM analysis event trigger
document.querySelector("#cmp-increase-T").onclick = increaseInput
document.querySelector("#cmp-decrease-T").onclick = decreaseInput
document.querySelector("#cmp-increase-E").onclick = increaseInput
document.querySelector("#cmp-decrease-E").onclick = decreaseInput
document.querySelector("#cmp-increase-N").onclick = increaseInput
document.querySelector("#cmp-decrease-N").onclick = decreaseInput
document.querySelector("#cmp-increase-M").onclick = increaseInput
document.querySelector("#cmp-decrease-M").onclick = decreaseInput
document.querySelector("#cmp-increase-P").onclick = increaseInput
document.querySelector("#cmp-decrease-P").onclick = decreaseInput
document.querySelector("#cmp-increase-bpk").onclick = increaseInput
document.querySelector("#cmp-decrease-bpk").onclick = decreaseInput

document.querySelector("#cmp-increase-mu").onclick = increaseInput
document.querySelector("#cmp-decrease-mu").onclick = decreaseInput
document.querySelector("#cmp-increase-phi").onclick = increaseInput
document.querySelector("#cmp-decrease-phi").onclick = decreaseInput

document.querySelector("#cmp-increase-Deletes").onclick = increaseInput
document.querySelector("#cmp-decrease-Deletes").onclick = decreaseInput
document.querySelector("#cmp-increase-DPT").onclick = increaseInput
document.querySelector("#cmp-decrease-DPT").onclick = decreaseInput
document.querySelector("#cmp-decrease-DPT").onclick = decreaseInput
document.querySelector("#cmp-increase-1-DPT").onclick = increaseInput
document.querySelector("#cmp-decrease-1-DPT").onclick = decreaseInput
document.querySelector("#cmp-increase-2-DPT").onclick = increaseInput
document.querySelector("#cmp-decrease-2-DPT").onclick = decreaseInput
document.querySelector("#cmp-increase-3-DPT").onclick = increaseInput
document.querySelector("#cmp-decrease-3-DPT").onclick = decreaseInput

document.querySelector("#autoplay-button").onclick = startPlaying

document.querySelectorAll(".play-class").forEach((btn) => {btn.onclick = buttonChange})
document.querySelector("#stop-button").onclick = stopPlaying
document.querySelector("#finish-button").onclick = finishProgress
document.querySelector("#switch-for-update-granularity").onchange = runCmp

document.querySelector("#cmp-input-T").onchange = runCmp
document.querySelector("#cmp-input-T").onwheel = runCmp
document.querySelector("#cmp-input-E").onchange = runCmp
document.querySelector("#cmp-input-E").onwheel = runCmp
document.querySelector("#cmp-input-N").oninput = changeProgressCapacity
document.querySelector("#cmp-input-N").onwheel = changeProgressCapacity
document.querySelector("#adjustable-progress-bar").onchange = runCmp
document.querySelector("#adjustable-progress-bar").onclick = dragHandler
document.querySelector("#lsm-cmpct-pp-1-progress-bar").onchange = runCmp
document.querySelector("#lsm-cmpct-pp-2-progress-bar").onchange = runCmp
document.querySelector("#lsm-cmpct-pp-3-progress-bar").onchange = runCmp

document.querySelector("#cmp-input-M").onchange = runCmp
document.querySelector("#cmp-input-M").onwheel = runCmp;

document.querySelector("#cmp-input-P").onchange = runCmp
document.querySelector("#cmp-input-P").onwheel = runCmp
document.querySelector("#cmp-input-bpk").onchange = runCmp
document.querySelector("#cmp-input-bpk").onwheel = runCmp

document.querySelector("#cmp-input-mu").onchange = runCmp
document.querySelector("#cmp-input-mu").onwheel = runCmp
document.querySelector("#cmp-input-phi").onchange = runCmp
document.querySelector("#cmp-input-phi").onwheel = runCmp
document.querySelector("#cmp-input-Deletes").onchange = runCmp
document.querySelector("#cmp-input-Deletes").onwheel = runCmp
document.querySelector("#cmp-input-DPT").onchange = runCmp
document.querySelector("#cmp-input-DPT").onwheel = runCmp

document.querySelector("#cmp-select-M").onchange = runCmp
document.querySelector("#cmp-select-E").onchange = runCmp
document.querySelector("#cmp-select-P").onchange = runCmp


document.querySelector("#show-stats-btn").onclick = function(){
  $("#show-stats-btn").hide()
  $("#cost-result").show()
  $("#show-plot-btn").show()
  $("#plot-result").hide()
  runPlots()
}
document.querySelector("#show-plot-btn").onclick = function(){
  $("#show-stats-btn").show()
  $("#cost-result").hide()
  $("#show-plot-btn").hide()
  $("#plot-result").show()
  runPlots()
}
})
